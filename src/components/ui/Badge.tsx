interface BadgeProps {
  variant: 'sale' | 'rent' | 'new';
  children: React.ReactNode;
  pulse?: boolean;
}

export function Badge({ variant, children, pulse }: BadgeProps) {
  const styles = {
    sale: 'bg-badge-sale text-white',
    rent: 'bg-badge-rent text-white',
    new: 'bg-accent text-white',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide ${styles[variant]} ${
        pulse ? 'animate-pulse-badge' : ''
      }`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2 mr-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
      )}
      {children}
    </span>
  );
}
