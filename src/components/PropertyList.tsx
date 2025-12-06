'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Property } from '@/types';
import { PropertyCard } from './PropertyCard';

interface PropertyListProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
}

const ITEMS_PER_PAGE = 12;

export function PropertyList({ properties, onPropertyClick }: PropertyListProps) {
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Reset display count when properties change (e.g., filter applied)
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [properties]);

  const loadMore = useCallback(() => {
    setDisplayCount(prev => Math.min(prev + ITEMS_PER_PAGE, properties.length));
  }, [properties.length]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < properties.length) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(loader);
    return () => observer.disconnect();
  }, [displayCount, properties.length, loadMore]);

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary text-lg">No properties match your filters</p>
        <p className="text-text-secondary text-sm mt-2">Try adjusting your search criteria</p>
      </div>
    );
  }

  const displayedProperties = properties.slice(0, displayCount);
  const hasMore = displayCount < properties.length;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedProperties.map(property => (
          <PropertyCard key={property.id} property={property} onClick={onPropertyClick} />
        ))}
      </div>

      {/* Infinite scroll loader */}
      <div ref={loaderRef} className="py-8 text-center">
        {hasMore ? (
          <div className="flex items-center justify-center gap-2 text-text-secondary">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span>Loading more...</span>
          </div>
        ) : (
          <p className="text-text-secondary text-sm">
            Showing all {properties.length} properties
          </p>
        )}
      </div>
    </div>
  );
}
