import {
    ActionPanelQA,
    DatalensHeaderQa,
    FixedHeaderQa,
    TableOfContentQa,
} from 'shared/constants/qa';

const OFFSETS_QA = [
    ActionPanelQA.ActionPanel,
    FixedHeaderQa.Controls,
    FixedHeaderQa.Container,
    TableOfContentQa.MobileTableOfContent,
    DatalensHeaderQa.DesktopContainer,
];

export const scrollIntoView = (scrollElement: string | HTMLElement, lastTop?: number | null) => {
    if (!scrollElement) {
        return null;
    }

    const element =
        typeof scrollElement === 'string' ? document.getElementById(scrollElement) : scrollElement;

    if (!element) {
        return null;
    }
    const currentTop = element.getBoundingClientRect().top;

    if (lastTop && currentTop === lastTop) {
        return lastTop;
    }

    const offsets = OFFSETS_QA.map(
        (qa) => document.querySelector(`[data-qa="${qa}"]`)?.clientHeight,
    );

    const offset = offsets.reduce((acc: number, cur: number | undefined) => acc + (cur || 0), 0);
    // offset of elements + small indentation from them
    element.style.scrollMarginTop = offset + 5 + 'px';

    element.scrollIntoView();

    return currentTop;
};
