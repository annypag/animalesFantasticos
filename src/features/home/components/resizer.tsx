"use client";

import React from "react";

interface ResizerProps {
  onMouseDown: () => void;
}

export function Resizer({ onMouseDown }: ResizerProps) {
  return (
    <div
      role="separator"
      tabIndex={0}
      className="w-1.5 cursor-col-resize bg-border hover:bg-primary/50 active:bg-primary transition-colors flex-shrink-0 z-10"
      onMouseDown={onMouseDown}
      // Opcional: Soporte básico para accesibilidad con teclado (espacio/enter)
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onMouseDown();
        }
      }}
    />
  );
}