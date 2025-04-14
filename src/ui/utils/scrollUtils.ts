// TODO: remove after support usage of scrollUtils in dash module
export const scrollIntoView = (
    id: string,
    options?: ScrollIntoViewOptions,
    elementTopOffset?: number,
) => {
    const element = document.getElementById(id);
    if (!element) {
        return;
    }
    // https://stackoverflow.com/questions/24665602/scrollintoview-scrolls-just-too-far/54494495#54494495
    const height = element.getBoundingClientRect().height;
    const pos = element.style.position;
    const top = element.style.top;
    element.style.position = 'relative';
    const offset = elementTopOffset || height;
    element.style.top = `-${offset}px`;
    element.scrollIntoView(options);
    element.style.top = top;
    element.style.position = pos;
};
