import { render, screen } from '@testing-library/react';
import { PropertyCard } from '@/components/PropertyCard';
import { Property } from '@/types';

const baseProperty: Property = {
  id: 'id',
  agencyId: 'a1',
  url: 'http://example.com',
  title: 'Home',
  listingType: 'sale',
  price: 100,
  priceDisplay: '€100',
  location: { city: 'Amsterdam' },
  images: ['img1.jpg', 'img2.jpg'],
  features: [],
  firstSeen: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  hash: 'hash',
};

describe('PropertyCard', () => {
  it('defaults to second image for Hoekstra listings', () => {
    render(
      <PropertyCard
        property={{ ...baseProperty, agencyId: 'hoekstra', images: ['promo.jpg', 'real.jpg'] }}
      />
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'real.jpg');
  });

  it('uses first image for non-Hoekstra listings', () => {
    render(<PropertyCard property={baseProperty} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'img1.jpg');
  });
});
