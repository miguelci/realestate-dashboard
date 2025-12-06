'use client';

import { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  count: number;
}

interface SearchableMultiSelectProps {
  options: SelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label: string;
}

export function SearchableMultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Search...',
  label,
}: SearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Sort options by count (descending) and get top 5 for quick chips
  const sortedOptions = [...options].sort((a, b) => b.count - a.count);
  const topOptions = sortedOptions.slice(0, 5);

  // Filter options based on search
  const filteredOptions = sortedOptions.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div ref={containerRef} className="space-y-2">
      <label className="block text-sm font-medium text-text-primary">{label}</label>

      {/* Quick select chips for top options */}
      <div className="flex flex-wrap gap-1">
        {topOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => toggleOption(opt.value)}
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors ${
              selected.includes(opt.value)
                ? 'bg-accent text-white'
                : 'bg-hover text-text-secondary hover:text-text-primary'
            }`}
          >
            <span className="truncate max-w-[80px]">{opt.label}</span>
            <span className={`${selected.includes(opt.value) ? 'text-white/70' : 'text-text-secondary/60'}`}>
              {opt.count}
            </span>
          </button>
        ))}
      </div>

      {/* Dropdown trigger */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 text-sm text-left border border-border rounded-md bg-white hover:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent flex items-center justify-between"
        >
          <span className={selected.length > 0 ? 'text-text-primary' : 'text-text-secondary'}>
            {selected.length > 0 ? `${selected.length} selected` : `All ${label.toLowerCase()}`}
          </span>
          <svg
            className={`w-4 h-4 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown panel */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md shadow-lg">
            {/* Search input */}
            <div className="p-2 border-b border-border">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                autoFocus
              />
            </div>

            {/* Selected count and clear */}
            {selected.length > 0 && (
              <div className="px-3 py-2 border-b border-border flex items-center justify-between bg-hover/50">
                <span className="text-xs text-text-secondary">{selected.length} selected</span>
                <button
                  onClick={clearAll}
                  className="text-xs text-accent hover:text-accent/80"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Options list */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-4 text-sm text-text-secondary text-center">
                  No results found
                </div>
              ) : (
                filteredOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => toggleOption(opt.value)}
                    className={`w-full px-3 py-2 text-sm text-left flex items-center justify-between hover:bg-hover transition-colors ${
                      selected.includes(opt.value) ? 'bg-accent/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          selected.includes(opt.value)
                            ? 'bg-accent border-accent'
                            : 'border-border'
                        }`}
                      >
                        {selected.includes(opt.value) && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-text-primary">{opt.label}</span>
                    </div>
                    <span className="text-text-secondary text-xs">{opt.count}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
