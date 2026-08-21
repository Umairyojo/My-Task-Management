import { GalleryVerticalEnd, type LucideProps } from "lucide-react";

type IconProps = Pick<LucideProps, "className" | "strokeWidth">;

export function BrandMark({ className = "" }: IconProps & { className?: string } = {}) {
  return (
    <span
      aria-hidden="true"
      className={[
        "inline-flex items-center justify-center rounded-[8px] bg-foreground text-background shadow-[0_1px_2px_rgba(0,0,0,0.12)]",
        className,
      ].join(" ")}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 4.25 5.85 17.75 12 19.9 18.15 17.75 12 4.25Z" />
        <path d="M12 4.25 8.25 17.75" />
        <path d="M12 4.25 15.75 17.75" />
      </svg>
    </span>
  );
}

export function GoogleMark({ className = "" }: { className?: string } = {}) {
  return (
    <span
      aria-hidden="true"
      className={[
        "inline-flex items-center justify-center text-[14px] font-semibold leading-none text-foreground",
        className,
      ].join(" ")}
    >
      G
    </span>
  );
}

export function TasksMark({ className = "" }: { className?: string } = {}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="2" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="2" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="2" />
    </svg>
  );
}

export function ProjectsMark({ className = "" }: { className?: string } = {}) {
  return <GalleryVerticalEnd className={className} aria-hidden="true" />;
}

export function FieldsMark({ className = "" }: { className?: string } = {}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.15"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="4" width="4" height="16" rx="1.2" />
      <rect x="10" y="4" width="4" height="16" rx="1.2" />
      <rect x="16" y="4" width="4" height="16" rx="1.2" />
    </svg>
  );
}
