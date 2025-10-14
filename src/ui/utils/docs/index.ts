import {DL} from '../../constants/common';

import {getDocsBaseUrl} from './helpers';

const regexpToMatchRelativePath = /href=(\.[^a-zA-Z0-9]+|\/|)(.+)/;
const regexpToMatchRelativeHref = /href="((?:(?!http|"|#).)*)"/g;
const PATH_IN_REGEXP_INDEX = 2;

export function formUrl(endpoint: string, path: string) {
    const normalizedEndpoint = endpoint.slice(-1) === '/' ? endpoint.slice(0, -1) : endpoint;
    const normalizedPath = path[0] === '/' ? path : '/' + path;
    return normalizedEndpoint + normalizedPath;
}

export function formDocsEndpointDL(path: string) {
    const {datalensDocs} = DL.ENDPOINTS;
    if (!datalensDocs) {
        return '';
    }
    return formUrl(datalensDocs, path);
}

export function formDocsEndpoint(path: string): string {
    const {docs} = DL.ENDPOINTS;
    return formUrl(docs, path);
}

export function replaceRelativeLinksToAbsoluteInHTML(doc: string) {
    return doc.replace(regexpToMatchRelativeHref, (subString: string) => {
        const matchedPath = subString.replace(/"/g, '').match(regexpToMatchRelativePath) || [];
        const path = matchedPath[PATH_IN_REGEXP_INDEX];
        if (path) {
            const baseUrl = getDocsBaseUrl();
            return `href="${baseUrl}/${path}"`;
        }
        return subString;
    });
}
