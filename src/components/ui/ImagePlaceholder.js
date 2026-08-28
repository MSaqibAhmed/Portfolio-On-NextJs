import { ImageIcon } from "lucide-react";

export default function ImagePlaceholder({ label, className = "" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 border border-dashed border-black/25 bg-black/5 text-center ${className}`}
    >
      <ImageIcon className="h-6 w-6 opacity-40" strokeWidth={1.5} />
      <span className="px-4 text-[0.65rem] uppercase tracking-[0.14em] opacity-50">
        {label}
      </span>
    </div>
  );
}
