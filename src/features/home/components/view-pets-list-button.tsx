"use client";

import { List } from "lucide-react";

interface ViewPetsListButtonProps {
  petCount: number;
  onClick: () => void;
}

export function ViewPetsListButton({ petCount, onClick }: ViewPetsListButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute bottom-6 left-1/2 z-[500] flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:opacity-90"
    >
      <List className="h-4 w-4" />
      Ver listado ({petCount})
    </button>
  );
}