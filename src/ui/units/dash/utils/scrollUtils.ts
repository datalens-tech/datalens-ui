import {ActionPanelQA, FixedHeaderQa, TableOfContentQa} from 'shared/constants/qa';

const OFFSETS_QA = [
    ActionPanelQA.ActionPanel,
    FixedHeaderQa.Controls,
    FixedHeaderQa.Container,
    TableOfContentQa.MobileTableOfContent,
    // TODO: add after use
    // DatalensHeader.DesktopContainer,
];

export const scrollIntoView = (id: string) => {
    const element = document.getElementById(id);
    if (!element) {
        return;
    }

    const offsets = OFFSETS_QA.map(
        (qa) => document.querySelector(`[data-qa="${qa}"]`)?.clientHeight,
    )
        // TODO: Remove
        .concat([
            document.querySelector('.dl-header__container:not(.dl-header__container_mobile)')
                ?.clientHeight,
        ]);

    const offset = offsets.reduce((acc: number, cur: number | undefined) => acc + (cur || 0), 0);
    // offset of elements + small indentation from them
    element.style.scrollMarginTop = offset + 5 + 'px';

    element.scrollIntoView();
};

// to have time to change the height of the react-grid-layout (200ms)
// DashKit rendering ended after location change (with manual page refresh) (50-70ms)
// small margin
const SCROLL_DELAY = 300;
export const scrollToHash = ({
    hash,
    withDelay,
    checkUserScroll,
}: {
    hash: string;
    withDelay?: boolean;
    checkUserScroll?: boolean;
}) => {
    setTimeout(
        () => {
            // if the user scrolls the page by himself, disable scrolling
            if (!checkUserScroll || window.scrollY === 0) {
                scrollIntoView(hash.replace('#', ''));
            }
        },
        withDelay ? SCROLL_DELAY : 0,
    );
};
