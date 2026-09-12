import Link from "next/link";
import { galleryDisplayItems, loadGalleryItems, publicObjectUrl } from "@/lib/gallery";

export default async function GalleryPreview({ count = 3 }: { count?: number }) {
  const items = galleryDisplayItems(await loadGalleryItems()).slice(0, count);
  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <li key={item.id}>
          <Link href="/gallery" className="group relative block overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={publicObjectUrl(item.after_path || item.path)} alt={item.alt} className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
            <span className="absolute inset-0 bg-purple-dark/0 transition group-hover:bg-purple-dark/20" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
