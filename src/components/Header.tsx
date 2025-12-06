'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  totalCount: number;
  lastUpdated?: string;
}

export function Header({ totalCount, lastUpdated }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-semibold text-text-primary">
              Property Listings
            </h1>
            <nav className="hidden sm:flex items-center gap-1">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/'
                    ? 'bg-hover text-text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-hover'
                }`}
              >
                Listings
              </Link>
              <Link
                href="/stats"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/stats'
                    ? 'bg-hover text-text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-hover'
                }`}
              >
                Statistics
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <span>{totalCount} properties</span>
            {lastUpdated && (
              <span className="hidden sm:inline">
                Updated: {new Date(lastUpdated).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
