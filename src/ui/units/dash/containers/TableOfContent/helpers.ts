const findScrollableElement = (element: Element | null): Element | null => {
    if (!element || element === document.documentElement) {
        return null;
    }

    if (element.scrollTop > 0) {
        return element;
    }

    return findScrollableElement(element.parentElement);
};

export const getUpdatedOffsets = (
    containerRef: React.MutableRefObject<HTMLDivElement | null>,
    options?: {minBottomOffset: number},
) => {
    const containerEl = containerRef.current;

    if (!containerEl) {
        return null;
    }

    const containerRect = containerEl.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    const leftOffset = `${containerRect.left}px`;
    const scrollableElement = findScrollableElement(containerEl);
    const topOffset = `${containerRect.top + (scrollableElement?.scrollTop ?? document.documentElement.scrollTop)}px`;
    const bottomOffset = `${Math.max(options?.minBottomOffset ?? 0, windowHeight - containerRect.bottom)}px`;

    return {topOffset, bottomOffset, leftOffset};
};
