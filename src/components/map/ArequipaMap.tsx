import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { AREQUIPA_CENTER } from '../../data/mockData';
import { BusTelemetry, BusStop } from '../../types';
import {
  Navigation,
  Compass,
  Layers,
  MapPin,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
} from 'lucide-react';

interface ArequipaMapProps {
  interactivePointSelection?: boolean;
  onPointSelect?: (lat: number, lng: number, type: 'origin' | 'destination') => void;
  selectionType?: 'origin' | 'destination' | null;
  originCoords?: [number, number] | null;
  destinationCoords?: [number, number] | null;
  className?: string;
}

export const ArequipaMap: React.FC<ArequipaMapProps> = ({
  interactivePointSelection = false,
  onPointSelect,
  selectionType = null,
  originCoords = null,
  destinationCoords = null,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const stopsLayerRef = useRef<L.LayerGroup | null>(null);
  const tripPointsLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  const [showStops, setShowStops] = useState<boolean>(true);

  const {
    buses,
    selectedBus,
    setSelectedBus,
    routes,
    selectedRoute,
    setSelectedRoute,
    showToast,
  } = useApp();

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
      return;
    }

    const container = mapContainerRef.current;

    const map = L.map(container, {
      center: AREQUIPA_CENTER,
      zoom: 14,
      minZoom: 11,
      maxZoom: 18,
      zoomControl: false, // Handled with custom UI buttons
    });

    const CARTO_KEY = 'cb1_46av_1_93d3871b07e0257ed75b209d';
    const streetTiles = L.tileLayer(
      `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`,
      {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20,
      }
    ).addTo(map);

    tileLayerRef.current = streetTiles;
    markersLayerRef.current = L.layerGroup().addTo(map);
    routesLayerRef.current = L.layerGroup().addTo(map);
    stopsLayerRef.current = L.layerGroup().addTo(map);
    tripPointsLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Use ResizeObserver to automatically resize map whenever container dimensions change
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(container);

    // Initial size calculation passes
    const timer1 = setTimeout(() => map.invalidateSize(), 150);
    const timer2 = setTimeout(() => map.invalidateSize(), 500);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer1);
      clearTimeout(timer2);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when style changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const CARTO_KEY = 'cb1_46av_1_93d3871b07e0257ed75b209d';
    const url =
      mapStyle === 'streets'
        ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

    const attribution =
      mapStyle === 'streets'
        ? '&copy; OpenStreetMap contributors &copy; CARTO'
        : 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye';

    tileLayerRef.current = L.tileLayer(url, {
      attribution,
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

  }, [mapStyle]);

  // Click on map to pick origin/destination
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (interactivePointSelection && onPointSelect && selectionType) {
        onPointSelect(e.latlng.lat, e.latlng.lng, selectionType);
      }
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [interactivePointSelection, onPointSelect, selectionType]);

  // Render Routes and Stops
  useEffect(() => {
    const routesLayer = routesLayerRef.current;
    const stopsLayer = stopsLayerRef.current;
    if (!routesLayer || !stopsLayer) return;

    routesLayer.clearLayers();
    stopsLayer.clearLayers();

    const routesToDisplay = selectedRoute ? [selectedRoute] : routes;

    routesToDisplay.forEach((route) => {
      const isSelected = selectedRoute?.id === route.id;

      const polyline = L.polyline(route.path, {
        color: route.color,
        weight: isSelected ? 6 : 4,
        opacity: isSelected ? 0.95 : 0.65,
        dashArray: isSelected ? undefined : '6, 6',
      });

      polyline.bindTooltip(
        `<div style="font-weight:bold; font-size:12px;">${route.code}: ${route.name}</div><div style="color:#64748b; font-size:11px;">Tarifa tramo: S/ ${route.fixedFare.toFixed(2)}</div>`,
        { sticky: true }
      );

      polyline.on('click', () => {
        setSelectedRoute(route);
        showToast(`Ruta activa: ${route.code} (${route.name})`, 'info');
      });

      routesLayer.addLayer(polyline);

      // Render stops if enabled or route selected
      if (showStops) {
        route.stops.forEach((stop: BusStop) => {
          const stopIcon = L.divIcon({
            className: 'custom-stop-icon',
            html: `
              <div style="background-color: ${route.color};" class="w-4 h-4 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[8px] font-black text-white hover:scale-125 transition-transform">
                ${stop.order}
              </div>
            `,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });

          const stopMarker = L.marker([stop.lat, stop.lng], { icon: stopIcon });
          stopMarker.bindPopup(`
            <div style="font-family: inherit; padding: 4px;">
              <span style="display:inline-block; font-size:10px; font-weight:700; color:${route.color}; background:#f1f5f9; padding:2px 6px; border-radius:4px; margin-bottom:4px;">PARADERO #${stop.order} · ${route.code}</span>
              <h4 style="font-size:13px; font-weight:700; margin:0 0 2px 0; color:#0f172a;">${stop.name}</h4>
              <p style="font-size:11px; margin:0; color:#64748b;">Distrito: <b>${stop.district}</b></p>
            </div>
          `);
          stopsLayer.addLayer(stopMarker);
        });
      }
    });
  }, [routes, selectedRoute, setSelectedRoute, showStops, showToast]);

  // Render Buses with Live Occupancy Color Indicators
  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    if (!markersLayer) return;

    markersLayer.clearLayers();

    buses.forEach((bus: BusTelemetry) => {
      const occupancyColors = {
        libre: { bg: '#10B981', border: '#059669', label: 'Libre' },
        medio: { bg: '#F59E0B', border: '#D97706', label: 'Medio' },
        lleno: { bg: '#EF4444', border: '#DC2626', label: 'Lleno' },
      }[bus.occupancy];

      const isSelected = selectedBus?.id === bus.id;

      const busDivIcon = L.divIcon({
        className: 'custom-bus-marker',
        html: `
          <div class="relative cursor-pointer" style="transform: translate(-50%, -50%);">
            ${
              isSelected
                ? `<div class="absolute -inset-2.5 rounded-full opacity-70 animate-ping" style="background-color: ${occupancyColors.bg};"></div>`
                : ''
            }
            <div class="flex items-center gap-1 px-2.5 py-1.5 rounded-full shadow-xl border-2 border-white transition-all transform hover:scale-110 active:scale-95"
                 style="background-color: ${occupancyColors.bg}; color: white; min-width: 65px; justify-content: center;">
              <svg class="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
              </svg>
              <span class="text-[11px] font-black tracking-tight">${bus.routeCode}</span>
            </div>
            <div class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs" style="background-color: ${occupancyColors.border};"></div>
          </div>
        `,
        iconSize: [68, 30],
        iconAnchor: [34, 15],
      });

      const marker = L.marker([bus.lat, bus.lng], { icon: busDivIcon });
      marker.on('click', () => {
        setSelectedBus(bus);
      });

      markersLayer.addLayer(marker);
    });
  }, [buses, selectedBus, setSelectedBus]);

  // Render Origin and Destination Pins
  useEffect(() => {
    const tripLayer = tripPointsLayerRef.current;
    if (!tripLayer) return;

    tripLayer.clearLayers();

    if (originCoords) {
      const originIcon = L.divIcon({
        className: 'origin-marker',
        html: `
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm shadow-xl border-2 border-white transform -translate-x-1/2 -translate-y-1/2 animate-bounce">
            A
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      tripLayer.addLayer(
        L.marker(originCoords, { icon: originIcon }).bindTooltip('Punto de Origen (A)', {
          permanent: true,
          direction: 'top',
        })
      );
    }

    if (destinationCoords) {
      const destIcon = L.divIcon({
        className: 'dest-marker',
        html: `
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-rose-600 text-white font-black text-sm shadow-xl border-2 border-white transform -translate-x-1/2 -translate-y-1/2 animate-bounce">
            B
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      tripLayer.addLayer(
        L.marker(destinationCoords, { icon: destIcon }).bindTooltip('Punto de Destino (B)', {
          permanent: true,
          direction: 'top',
        })
      );
    }

    if (originCoords && destinationCoords) {
      const line = L.polyline([originCoords, destinationCoords], {
        color: '#0284C7',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.85,
      });
      tripLayer.addLayer(line);
    }
  }, [originCoords, destinationCoords]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleCenterArequipa = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(AREQUIPA_CENTER, 14, { animate: true });
      showToast('Mapa centrado en Plaza de Armas de Arequipa', 'info');
    }
  };

  const handleTrackBus = () => {
    if (selectedBus && mapInstanceRef.current) {
      mapInstanceRef.current.setView([selectedBus.lat, selectedBus.lng], 16, { animate: true });
      showToast(`Siguiendo unidad ${selectedBus.plate} (${selectedBus.routeCode})`, 'info');
    } else if (buses.length > 0 && mapInstanceRef.current) {
      const first = buses[0];
      setSelectedBus(first);
      mapInstanceRef.current.setView([first.lat, first.lng], 16, { animate: true });
      showToast(`Centrado en bus ${first.plate}`, 'info');
    } else {
      handleCenterArequipa();
    }
  };

  return (
    <div
      className={`relative w-full h-full min-h-[400px] flex-1 bg-slate-200 overflow-hidden ${className}`}
      style={{ minHeight: '100%', height: '100%', width: '100%' }}
    >
      {/* Real Map DOM Mount Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[400px] absolute inset-0 z-0 touch-map-container"
        style={{ minHeight: '100%', height: '100%', width: '100%' }}
      />

      {/* Top Banner when picking a point on map */}
      {interactivePointSelection && selectionType && (
        <div className="absolute top-3 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md z-30 pointer-events-none">
          <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold py-2.5 px-4 rounded-2xl shadow-2xl border border-slate-700/60 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  selectionType === 'origin' ? 'bg-emerald-400' : 'bg-rose-400'
                } animate-ping`}
              />
              <span>
                Toca el mapa para fijar el{' '}
                <b>{selectionType === 'origin' ? 'Punto de Origen (A)' : 'Punto de Destino (B)'}</b>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Map Control Bar (Top Right) */}
      <div className="absolute top-3 right-3 z-30 flex flex-col gap-1.5 shadow-lg rounded-2xl overflow-hidden bg-white/95 backdrop-blur-md border border-slate-200/80 p-1">
        <button
          onClick={handleZoomIn}
          title="Acercar Zoom"
          className="w-10 h-10 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ZoomIn className="w-5 h-5" />
        </button>

        <button
          onClick={handleZoomOut}
          title="Alejar Zoom"
          className="w-10 h-10 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border-t border-slate-100"
        >
          <ZoomOut className="w-5 h-5" />
        </button>

        <button
          onClick={() => setMapStyle(mapStyle === 'streets' ? 'satellite' : 'streets')}
          title="Cambiar vista a Satelital / Calles"
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors border-t border-slate-100 ${
            mapStyle === 'satellite' ? 'bg-sky-50 text-sky-600 font-bold' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowStops(!showStops)}
          title={showStops ? 'Ocultar Paraderos' : 'Mostrar Paraderos'}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors border-t border-slate-100 ${
            showStops ? 'text-sky-600 bg-sky-50/60' : 'text-slate-400 hover:bg-slate-100'
          }`}
        >
          {showStops ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </button>
      </div>

      {/* Floating Action Buttons (FABs) for Location (SRS UI-01) */}
      <div className="absolute bottom-24 md:bottom-6 right-3 z-30 flex flex-col gap-2">
        <button
          onClick={handleTrackBus}
          title="Seguir Autobús Seleccionado"
          className="w-12 h-12 rounded-2xl bg-white shadow-xl border border-slate-200/90 flex items-center justify-center text-slate-700 hover:text-sky-600 hover:bg-slate-50 transition-all active:scale-95"
        >
          <Navigation className="w-5 h-5 text-sky-600" />
        </button>

        <button
          onClick={handleCenterArequipa}
          title="Centrar en Plaza de Armas Arequipa"
          className="w-12 h-12 rounded-2xl bg-emerald-600 shadow-xl border border-emerald-500 flex items-center justify-center text-white hover:bg-emerald-700 transition-all active:scale-95"
        >
          <Compass className="w-5 h-5" />
        </button>
      </div>

      {/* Occupancy Legend (SRS UI-01 & RF-3.3) */}
      <div className="hidden sm:flex absolute bottom-6 left-3 z-30 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-2.5 shadow-xl text-xs flex-col gap-1.5 max-w-xs">
        <div className="font-bold text-slate-800 flex items-center justify-between text-[11px] uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Nivel de Ocupación en Vivo
          </span>
          <span className="text-[10px] text-slate-400 font-mono">SIT AQP</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Libre
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medio
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Lleno
          </span>
        </div>
      </div>
    </div>
  );
};
