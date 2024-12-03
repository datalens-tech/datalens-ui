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

export const scrollIntoView = (id: string, lastTop?: number | null) => {
    if (!id) {
        return null;
    }

    const element = document.getElementById(id);

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
