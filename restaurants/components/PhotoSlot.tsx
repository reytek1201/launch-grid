import Image from "next/image";
import { getPhoto } from "@/lib/config";

type Props = {
  photo?: string;
  /** Tailwind aspect class, e.g. "aspect-[4/5]" */
  ratio?: string;
  sizes?: string;
  hero?: boolean;
  className?: string;
  /** Override the focal point, e.g. "50% 30%" */
  focal?: string;
  label?: string;
};

export function PhotoSlot({ photo, ratio = "aspect-[4/3]", sizes = "(min-width: 1024px) 50vw, 100vw", hero, className = "", focal, label }: Props) {
  const p = getPhoto(photo);
  if (!p) {
    return (
      <div className={`${ratio} ${className} flex items-center justify-center bg-espresso/10 text-xs uppercase tracking-widest text-espresso/50`} role="img" aria-label={label ?? "Photo coming soon"}>
        {label ?? "Photo coming soon"}
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden ${ratio} ${className}`}>
      <Image
        src={p.src}
        alt={p.alt}
        fill
        sizes={sizes}
        quality={85}
        preload={hero}
        style={{ objectFit: "cover", objectPosition: focal ?? p.focal }}
      />
    </div>
  );
}
