"use client";

import { useEffect, useState } from "react";
import { HERO_WORDS } from "@/lib/publicCopy";

export default function HeroHeadline() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const swap = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((current) => (current + 1) % HERO_WORDS.length);
        setVisible(true);
      }, 220);
    }, 2600);
    return () => window.clearInterval(swap);
  }, []);

  return (
    <h1 className="font-display mt-3 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
      A cleaner{" "}
      <span
        className={`inline-block min-w-[7.5ch] transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
        aria-live="polite"
      >
        {HERO_WORDS[index]}
      </span>{" "}
      without the stress.
    </h1>
  );
}
