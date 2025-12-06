'use client';

import { useEffect, useState } from 'react';
import { Property } from '@/types';
import { Badge } from './ui/Badge';
import { getAgencyName, isNewProperty, formatTimeAgo } from '@/lib/data';

interface PropertyCardProps {
  property: Property;
  onClick?: (property: Property) => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  const getInitialImageIndex = (p: Property) =>
    p.agencyId === 'hoekstra' && p.images && p.images.length > 1 ? 1 : 0;

  const [currentImage, setCurrentImage] = useState(() => getInitialImageIndex(property));
  const [copySuccess, setCopySuccess] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const isNew = isNewProperty(property);

  useEffect(() => {
    setCurrentImage(getInitialImageIndex(property));
    setImageLoaded(false);
  }, [property]);

  useEffect(() => {
    setImageLoaded(false);
  }, [currentImage]);

  // Get walking distance to first POI if available
  const poiDistance = property.distanceToPOI
    ? Object.entries(property.distanceToPOI)[0]
    : null;

  const images = property.images?.slice(0, 4) || [];
  const hasImages = images.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on interactive elements
    if ((e.target as HTMLElement).closest('a, button, .image-nav')) return;
    onClick?.(property);
  };

  const handleCopyAddress = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const address = `${property.title}, ${property.location.city}`;
    try {
      await navigator.clipboard.writeText(address);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div
      className={`bg-surface rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={handleClick}
    >
      {/* Image gallery */}
      {hasImages && (
        <div className="relative">
          <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
            <img
              src={images[currentImage]}
              alt={property.title}
              loading="lazy"
              className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-hover to-white animate-pulse" />
            )}
          </div>

          {/* Image dots/thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 image-nav">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImage(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentImage
                      ? 'bg-white scale-110'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Badges overlay */}
          <div className="absolute top-2 left-2 flex items-center gap-2">
            <Badge variant={property.listingType}>
              {property.listingType === 'rent' ? 'Rent' : 'Sale'}
            </Badge>
            {isNew && <Badge variant="new" pulse>New</Badge>}
          </div>

          {/* Price overlay */}
          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-semibold">
            {property.priceDisplay}
          </div>
        </div>
      )}

      <div className="p-4">
        {/* No image fallback badges */}
        {!hasImages && (
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Badge variant={property.listingType}>
                {property.listingType === 'rent' ? 'Rent' : 'Sale'}
              </Badge>
              {isNew && <Badge variant="new" pulse>New</Badge>}
            </div>
            <span className="text-lg font-semibold text-accent">
              {property.priceDisplay}
            </span>
          </div>
        )}

        <h3 className="font-medium text-text-primary mb-1 line-clamp-1">
          {property.title}
        </h3>

        {/* Clickable address */}
        <button
          onClick={handleCopyAddress}
          className="text-sm text-text-secondary mb-3 hover:text-accent transition-colors flex items-center gap-1 text-left"
          title="Click to copy address"
        >
          {copySuccess ? (
            <>
              <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <span>{property.location.city}</span>
              {property.location.street && <span>, {property.location.street}</span>}
            </>
          )}
        </button>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary mb-3">
          {property.sqm && <span>{property.sqm} m²</span>}
          {property.bedrooms && (
            <span>
              {property.bedrooms} bedroom{property.bedrooms > 1 ? 's' : ''}
            </span>
          )}
          <span>{getAgencyName(property.agencyId)}</span>
        </div>

        {poiDistance && poiDistance[1].walking && (
          <p className="text-sm text-text-secondary mb-3">
            <span className="mr-1">🚶</span>
            {poiDistance[1].walking.minutes} min to{' '}
            {poiDistance[0].replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xs text-text-secondary">
            {formatTimeAgo(property.firstSeen)}
          </span>
          <a
            href={property.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-accent hover:underline"
          >
            View Listing →
          </a>
        </div>
      </div>
    </div>
  );
}
