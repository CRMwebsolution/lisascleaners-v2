import Link from "next/link";
import { GALLERY_PHOTOS } from "@/lib/publicCopy";

export default function GalleryPreview({ count = 3 }: { count?: number }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      {GALLERY_PHOTOS.slice(0, count).map((photo) => (
        <li key={photo.url}>
          <Link href="/gallery" className="group relative block overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt={photo.alt} className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
            <span className="absolute inset-0 bg-purple-dark/0 transition group-hover:bg-purple-dark/20" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
