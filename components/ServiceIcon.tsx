const paths: Record<string, string> = {
  residential: "M6 21 L18 9 L30 21 V29 H6 Z M13 29 V22 H18 V29",
  office: "M8 10 H28 V28 H8 Z M12 14 H16 V18 H12 Z M20 14 H24 V18 H20 Z M12 21 H24",
  "deep-clean": "M18 7 L19.5 13 L25 14.5 L19.5 16 L18 22 L16.5 16 L11 14.5 L16.5 13 Z M26 20 L27 23 L30 24 L27 25 L26 28 L25 25 L22 24 L25 23 Z",
  "move-in-out": "M7 14 H21 V28 H7 Z M21 18 H29 L27 28 H21 M11 18 H17 M11 22 H17",
  recurring: "M10 11 A9 9 0 1 1 9 20 M10 11 V16 H15",
  "window-and-floor": "M8 8 H28 V20 H8 Z M18 8 V20 M8 14 H28 M8 24 H28 M12 28 H24",
  "vacation-rental": "M10 20 A8 8 0 0 1 26 20 V28 H10 Z M16 24 H20 M18 11 V14",
};

export default function ServiceIcon({ slug }: { slug: string }) {
  return (
    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-purple-soft text-purple-dark">
      <svg viewBox="0 0 36 36" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={paths[slug] ?? paths.residential} />
      </svg>
    </span>
  );
}
