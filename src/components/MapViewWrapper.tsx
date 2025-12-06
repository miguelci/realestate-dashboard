'use client';

import dynamic from 'next/dynamic';
import { Property } from '@/types';

const MapView = dynamic(() => import('./MapView').then(mod => ({ default: mod.MapView })), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] rounded-lg border border-border bg-hover flex items-center justify-center">
      <div className="text-text-secondary">Loading map...</div>
    </div>
  ),
});

interface MapViewWrapperProps {
  properties: Property[];
  onPropertyClick: (property: Property) => void;
  showCoordsOnly: boolean;
  onToggleCoordsOnly: (value: boolean) => void;
  totalCount: number;
}

export function MapViewWrapper({
  properties,
  onPropertyClick,
  showCoordsOnly,
  onToggleCoordsOnly,
  totalCount,
}: MapViewWrapperProps) {
  const mapProps = showCoordsOnly
    ? properties.filter(p => p.location?.coordinates?.lat && p.location?.coordinates?.lon)
    : properties;

  return (
    <MapView
      properties={mapProps}
      onPropertyClick={onPropertyClick}
      showCoordsOnly={showCoordsOnly}
      onToggleCoordsOnly={onToggleCoordsOnly}
      totalCount={totalCount}
    />
  );
}
