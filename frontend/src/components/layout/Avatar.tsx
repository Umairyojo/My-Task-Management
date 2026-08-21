"use client";

import Image from "next/image";

interface AvatarProps {
  alt: string;
  initials: string;
  src?: string | null;
  sizeClassName?: string;
  textClassName?: string;
  className?: string;
}

export function Avatar({
  alt,
  initials,
  src,
  sizeClassName = "h-8 w-8",
  textClassName = "text-[12px]",
  className = "",
}: AvatarProps) {
  return (
    <div
      className={[
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface",
        sizeClassName,
        className,
      ].join(" ")}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          sizes="100vw"
          className="object-cover object-center"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className={["font-semibold text-foreground", textClassName].join(" ")}>
          {initials}
        </span>
      )}
    </div>
  );
}
