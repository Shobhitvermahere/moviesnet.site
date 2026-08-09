interface WebsiteDragHandleProps {
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  className?: string;
}

export function WebsiteDragHandle({ onDragStart, onDragEnd, className = '' }: WebsiteDragHandleProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`flex-shrink-0 text-white/25 hover:text-white/60 cursor-grab active:cursor-grabbing select-none touch-none ${className}`}
      title="Drag to reorder"
      aria-label="Drag to reorder"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="9" cy="6" r="1.5" />
        <circle cx="15" cy="6" r="1.5" />
        <circle cx="9" cy="12" r="1.5" />
        <circle cx="15" cy="12" r="1.5" />
        <circle cx="9" cy="18" r="1.5" />
        <circle cx="15" cy="18" r="1.5" />
      </svg>
    </div>
  );
}
