export default function BrandMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="#16324f" />
      <path d="M8 22 L20 12 L32 22 V31 H8 Z" fill="#f7f1e8" />
      <path d="M16 31 V24 H24 V31" fill="#2a7f74" />
      <path d="M28 11.5 L29.2 14.2 L32 14.6 L30 16.6 L30.5 19.4 L28 18 L25.5 19.4 L26 16.6 L24 14.6 L26.8 14.2 Z" fill="#e6d5bc" />
    </svg>
  );
}
