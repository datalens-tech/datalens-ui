export const getUpdatedOffsets = (containerRef: React.MutableRefObject<HTMLDivElement | null>) => {
    const containerEl = containerRef.current;

    if (!containerEl) {
        return null;
    }

    const containerRect = containerEl.getBoundingClientRect();
    const scrollTop = document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;

    const leftOffset = `${containerRect.left}px`;
    const topOffset = `${containerRect.top + scrollTop}px`;
    const bottomOffset = `${Math.max(0, windowHeight - containerRect.bottom)}px`;

    return {topOffset, bottomOffset, leftOffset};
};
