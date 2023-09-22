export function escapeHTML(html = '') {
    const elem = document.createElement('span');

    elem.innerText = html;
    return elem.innerHTML;
}
