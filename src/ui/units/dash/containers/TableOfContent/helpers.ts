const findScrollableElement = (element: Element | null): Element | null => {
    if (!element || element === document.documentElement) {
        return null;
    }

    if (element.scrollTop > 0) {
        return element;
    }

    return findScrollableElement(element.parentElement);
};

const isDivRef = (
    value: HTMLDivElement | React.MutableRefObject<HTMLDivElement | null> | null,
): value is React.MutableRefObject<HTMLDivElement | null> => {
    return typeof value === 'object' && value !== null && 'current' in value;
};

export const getUpdatedOffsets = (
    container: HTMLDivElement | React.MutableRefObject<HTMLDivElement | null> | null,
) => {
    const containerEl = isDivRef(container) ? container.current : container;

    if (!containerEl) {
        return null;
    }

    const containerRect = containerEl.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    const leftOffset = `${containerRect.left}px`;
    const scrollableElement = findScrollableElement(containerEl.parentElement);
    const topOffset = `${containerRect.top + (scrollableElement?.scrollTop ?? document.documentElement.scrollTop)}px`;
    const bottomOffset = `${Math.max(0, windowHeight - containerRect.bottom)}px`;

    return {topOffset, bottomOffset, leftOffset};
};
