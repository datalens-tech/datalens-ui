import {
    ActionPanelQA,
    DatalensHeaderQa,
    FixedHeaderQa,
    TableOfContentQa,
} from 'shared/constants/qa';

const OFFSETS_QA = [
    ActionPanelQA.ActionPanel,
    TableOfContentQa.MobileTableOfContent,
    DatalensHeaderQa.DesktopContainer,
];

const queryByQA = (qa: string) => document.querySelector(`[data-qa="${qa}"]`);

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

    const offsets = OFFSETS_QA.map((qa) => queryByQA(qa)?.clientHeight);

    const fixedWrapper = queryByQA(FixedHeaderQa.Wrapper);
    if (!fixedWrapper?.contains(element)) {
        offsets.push(fixedWrapper?.clientHeight);
    }

    const offset = offsets.reduce((acc: number, cur: number | undefined) => acc + (cur || 0), 0);
    // offset of elements + small indentation from them
    element.style.scrollMarginTop = offset + 5 + 'px';

    element.scrollIntoView();

    return currentTop;
};
