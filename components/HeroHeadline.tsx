"use client";

import { useEffect, useState } from "react";

const WORDS = ["home", "office", "rental"] as const;

export default function HeroHeadline() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % WORDS.length);
    }, 2500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <h1 className="font-display mt-3 text-4xl font-semibold leading-tight text-white sm:text-5xl">
      A cleaner {WORDS[index]} without the stress.
    </h1>
  );
}
