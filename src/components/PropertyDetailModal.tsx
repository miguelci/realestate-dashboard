'use client';

import { useEffect, useState } from 'react';
import { Property } from '@/types';
import { Badge } from './ui/Badge';
import { getAgencyName } from '@/lib/data';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
}

export function PropertyDetailModal({ property, onClose }: PropertyDetailModalProps) {
  const getInitialImageIndex = (p: Property | null) =>
    p && p.agencyId === 'hoekstra' && p.images && p.images.length > 1 ? 1 : 0;

  const [currentImageIndex, setCurrentImageIndex] = useState(() => getInitialImageIndex(property));
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset image index when property changes
  useEffect(() => {
    setCurrentImageIndex(getInitialImageIndex(property));
    setImageLoaded(false);
  }, [property?.id]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (property) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [property]);

  if (!property) return null;

  const images = property.images || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % images.length);
    setImageLoaded(false);
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
    setImageLoaded(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Badge variant={property.listingType === 'sale' ? 'sale' : 'rent'}>
              {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
            </Badge>
            <span className="text-sm text-text-secondary">
              {getAgencyName(property.agencyId)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-hover rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Image carousel */}
          <div className="relative bg-gray-100 aspect-video">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImageIndex]}
                  alt={`${property.title} - Image ${currentImageIndex + 1}`}
                  loading="lazy"
                  className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-br from-hover to-white animate-pulse" />
                )}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-secondary">
                No images available
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6">
            {/* Title and price */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-text-primary mb-1">
                  {property.title}
                </h2>
                <p className="text-text-secondary">
                  {property.location?.city}
                  {property.location?.neighborhood && `, ${property.location.neighborhood}`}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-accent">
                  {property.priceDisplay || `€${property.price.toLocaleString()}`}
                </div>
                {property.listingType === 'rent' && (
                  <span className="text-text-secondary text-sm">/month</span>
                )}
              </div>
            </div>

            {/* Key specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {property.sqm && (
                <div className="bg-hover rounded-lg p-3 text-center">
                  <div className="text-lg font-semibold text-text-primary">{property.sqm} m²</div>
                  <div className="text-xs text-text-secondary">Living Area</div>
                </div>
              )}
              {property.bedrooms !== undefined && (
                <div className="bg-hover rounded-lg p-3 text-center">
                  <div className="text-lg font-semibold text-text-primary">{property.bedrooms}</div>
                  <div className="text-xs text-text-secondary">Bedrooms</div>
                </div>
              )}
              {property.sqm && property.price && (
                <div className="bg-hover rounded-lg p-3 text-center">
                  <div className="text-lg font-semibold text-text-primary">
                    €{Math.round(property.price / property.sqm).toLocaleString()}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {property.listingType === 'rent' ? 'per m²/mo' : 'per m²'}
                  </div>
                </div>
              )}
              {property.firstSeen && (
                <div className="bg-hover rounded-lg p-3 text-center">
                  <div className="text-lg font-semibold text-text-primary">
                    {formatDate(property.firstSeen)}
                  </div>
                  <div className="text-xs text-text-secondary">First Seen</div>
                </div>
              )}
            </div>

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-text-primary mb-3">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {property.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-hover rounded-full text-sm text-text-secondary"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* POI Distances */}
            {property.distanceToPOI && Object.keys(property.distanceToPOI).length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-text-primary mb-3">Distances</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(property.distanceToPOI).map(([poi, data]) => (
                    <div key={poi} className="flex items-center justify-between p-3 bg-hover rounded-lg">
                      <span className="text-text-primary capitalize">{poi.replace(/-/g, ' ')}</span>
                      <div className="text-right text-sm">
                        {data.walking && (
                          <div className="text-text-secondary">
                            🚶 {data.walking.minutes} min ({(data.walking.meters / 1000).toFixed(1)} km)
                          </div>
                        )}
                        {data.cycling && (
                          <div className="text-text-secondary">
                            🚴 {data.cycling.minutes} min ({(data.cycling.meters / 1000).toFixed(1)} km)
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Coordinates */}
            {property.location?.coordinates && (
              <div className="mb-6 text-sm text-text-secondary">
                📍 {property.location.coordinates.lat.toFixed(5)}, {property.location.coordinates.lon.toFixed(5)}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-hover/50">
          <a
            href={property.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 px-4 bg-accent hover:bg-accent/90 text-white text-center font-medium rounded-lg transition-colors"
          >
            View on {getAgencyName(property.agencyId)} →
          </a>
        </div>
      </div>
    </div>
  );
}
