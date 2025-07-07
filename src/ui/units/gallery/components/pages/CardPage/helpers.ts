import {GALLERY_ITEM_CATEGORY} from 'shared/constants';
import type {GalleryItemCategory, Lang} from 'shared/types';
import {URL_OPTIONS} from 'ui/constants';

export function getIframeUrl({
    publicUrl,
    lang,
    theme,
}: {
    publicUrl?: string;
    lang: string;
    theme: string;
}) {
    if (!publicUrl) {
        return publicUrl;
    }

    const url = new URL(publicUrl);

    url.searchParams.set(URL_OPTIONS.LANGUAGE, lang);
    url.searchParams.set(URL_OPTIONS.THEME, theme);

    return url.toString();
}

export function getIframeLang({
    labels,
    defaultLang,
}: {
    labels?: GalleryItemCategory[];
    defaultLang: Lang;
}) {
    return labels && labels.includes(GALLERY_ITEM_CATEGORY.ENGLISH) ? 'en' : defaultLang;
}
