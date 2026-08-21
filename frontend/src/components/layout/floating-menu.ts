export interface FloatingMenuPosition {
  top: number;
  left: number;
  width: number;
}

interface MenuPositionOptions {
  gap?: number;
  padding?: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getAnchoredMenuPosition(
  anchorRect: DOMRect,
  menuWidth: number,
  viewportWidth: number,
  viewportHeight: number,
  menuHeight: number,
  options: MenuPositionOptions = {},
): FloatingMenuPosition {
  const gap = options.gap ?? 8;
  const padding = options.padding ?? 8;
  const width = Math.min(menuWidth, Math.max(0, viewportWidth - padding * 2));
  const left = clamp(anchorRect.right - width, padding, viewportWidth - width - padding);
  const top = clamp(
    anchorRect.bottom + gap,
    padding,
    Math.max(padding, viewportHeight - menuHeight - padding),
  );

  return { top, left, width };
}

export function getSubmenuPosition(
  anchorRect: DOMRect,
  panelWidth: number,
  panelHeight: number,
  viewportWidth: number,
  viewportHeight: number,
  options: MenuPositionOptions = {},
): FloatingMenuPosition {
  const gap = options.gap ?? 8;
  const padding = options.padding ?? 8;
  const width = Math.min(panelWidth, Math.max(0, viewportWidth - padding * 2));
  const openToRight = anchorRect.right + gap + width <= viewportWidth - padding;

  const left = openToRight
    ? anchorRect.right + gap
    : Math.max(padding, anchorRect.left - gap - width);

  const top = clamp(
    anchorRect.top,
    padding,
    Math.max(padding, viewportHeight - panelHeight - padding),
  );

  return { top, left, width };
}
