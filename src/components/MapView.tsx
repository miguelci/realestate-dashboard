'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Property } from '@/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  properties: Property[];
  onPropertyClick: (property: Property) => void;
  showCoordsOnly: boolean;
  onToggleCoordsOnly: (value: boolean) => void;
  totalCount: number;
}

// Custom marker icons
const createMarkerIcon = (type: 'sale' | 'rent') => {
  const color = type === 'sale' ? '#DC2626' : '#059669';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

const saleIcon = createMarkerIcon('sale');
const rentIcon = createMarkerIcon('rent');

export function MapView({
  properties,
  onPropertyClick,
  showCoordsOnly,
  onToggleCoordsOnly,
  totalCount,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [visibleProps, setVisibleProps] = useState<Property[]>([]);

  // Filter properties with valid coordinates
  const propertiesWithCoords = useMemo(() => {
    return properties.filter(
      p => p.location?.coordinates?.lat && p.location?.coordinates?.lon
    );
  }, [properties]);

  // Calculate map bounds
  const bounds = useMemo(() => {
    if (propertiesWithCoords.length === 0) {
      // Default to Netherlands center
      return L.latLngBounds([[52.3, 4.7], [52.5, 5.0]]);
    }
    const coords = propertiesWithCoords.map(p => [
      p.location!.coordinates!.lat,
      p.location!.coordinates!.lon,
    ] as [number, number]);
    return L.latLngBounds(coords).pad(0.1);
  }, [propertiesWithCoords]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Set an initial view so map has center/zoom before any data loads
    mapRef.current.setView([52.4, 4.85], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapRef.current);

    markersRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when properties change
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Add new markers
    propertiesWithCoords.forEach(property => {
      const { lat, lon } = property.location!.coordinates!;
      const icon = property.listingType === 'sale' ? saleIcon : rentIcon;

      const marker = L.marker([lat, lon], { icon })
        .bindPopup(`
          <div style="min-width: 200px; padding: 4px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${property.title}</div>
            <div style="color: #0D9488; font-weight: 600; margin-bottom: 4px;">
              ${property.priceDisplay || '€' + property.price.toLocaleString()}
              ${property.listingType === 'rent' ? '/mo' : ''}
            </div>
            <div style="color: #78716C; font-size: 12px;">
              ${property.sqm ? property.sqm + ' m²' : ''}
              ${property.bedrooms ? ' • ' + property.bedrooms + ' bed' : ''}
            </div>
            <div style="margin-top: 8px;">
              <button
                onclick="window.dispatchEvent(new CustomEvent('propertyClick', { detail: '${property.id}' }))"
                style="
                  background: #0D9488;
                  color: white;
                  border: none;
                  padding: 6px 12px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 12px;
                  width: 100%;
                "
              >View Details</button>
            </div>
          </div>
        `, {
          closeButton: true,
          className: 'property-popup',
        });

      marker.addTo(markersRef.current!);
    });

    // Fit bounds
    if (propertiesWithCoords.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [propertiesWithCoords, bounds]);

  // Listen for property click events from popup
  useEffect(() => {
    const handlePropertyClick = (e: CustomEvent<string>) => {
      const property = properties.find(p => p.id === e.detail);
      if (property) {
        onPropertyClick(property);
      }
    };

    window.addEventListener('propertyClick', handlePropertyClick as EventListener);
    return () => {
      window.removeEventListener('propertyClick', handlePropertyClick as EventListener);
    };
  }, [properties, onPropertyClick]);

  // Track which properties are currently in view
  useEffect(() => {
    if (!mapRef.current) return;
    const updateVisible = () => {
      const viewBounds = mapRef.current!.getBounds();
      const inView = propertiesWithCoords.filter(p =>
        viewBounds.contains([p.location!.coordinates!.lat, p.location!.coordinates!.lon])
      );
      setVisibleProps(inView);
    };
    updateVisible();
    mapRef.current.on('moveend', updateVisible);
    return () => {
      mapRef.current?.off('moveend', updateVisible);
    };
  }, [propertiesWithCoords]);

  const noCoordCount = properties.length - propertiesWithCoords.length;

  return (
    <div className="relative h-[600px] rounded-lg overflow-hidden border border-border">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <div className="text-xs font-medium text-text-primary mb-2">Legend</div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-badge-sale" />
          <span className="text-xs text-text-secondary">For Sale</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-badge-rent" />
          <span className="text-xs text-text-secondary">For Rent</span>
        </div>
      </div>

      {/* Stats + controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000] space-y-2 w-64">
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-primary font-medium">
            {propertiesWithCoords.length} on map
          </div>
          <button
            onClick={() => onToggleCoordsOnly(!showCoordsOnly)}
            className={`text-xs px-2 py-1 rounded-md border ${
              showCoordsOnly ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            {showCoordsOnly ? 'Coords only' : 'All'}
          </button>
        </div>
        {noCoordCount > 0 && (
          <div className="text-xs text-text-secondary">
            {noCoordCount} without location (of {totalCount})
          </div>
        )}
        <div className="border-t border-border pt-2">
          <div className="text-xs font-medium text-text-secondary mb-1">
            In view ({visibleProps.length})
          </div>
          {visibleProps.slice(0, 4).map(p => (
            <button
              key={p.id}
              onClick={() => onPropertyClick(p)}
              className="w-full text-left text-xs text-text-primary hover:text-accent truncate"
              title={p.title}
            >
              {p.title}
            </button>
          ))}
          {visibleProps.length === 0 && (
            <div className="text-xs text-text-secondary">Pan/zoom to see listings</div>
          )}
          {visibleProps.length > 4 && (
            <div className="text-[11px] text-text-secondary mt-1">
              +{visibleProps.length - 4} more in view
            </div>
          )}
        </div>
      </div>

      {propertiesWithCoords.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-[1000]">
          <div className="text-center">
            <div className="text-text-secondary mb-2">No properties with coordinates</div>
            <div className="text-sm text-text-secondary">
              Run the geocoding service to add locations
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
