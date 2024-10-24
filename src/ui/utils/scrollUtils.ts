export const scrollIntoView = (
    id: string,
    _options?: ScrollIntoViewOptions,
    _elementTopOffset?: number,
) => {
    const element = document.getElementById(id);
    if (!element) {
        return;
    }

    const offsets = [
        document.querySelector('.action-panel')?.clientHeight,
        document.querySelector('.dash-fixed-header__controls')?.clientHeight,
        document.querySelector('.dash-fixed-header__container')?.clientHeight,
        document.querySelector('.dl-header')?.clientHeight,
    ];

    const offset = offsets.reduce((acc: number, cur: number | undefined) => acc + (cur || 0), 0);
    element.style.scrollMarginTop = offset + 'px';

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
