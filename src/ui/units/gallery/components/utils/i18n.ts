import {I18n} from 'i18n';
import {DL} from 'ui/constants/common';

export function getLang() {
    return DL.USER_LANG || 'en';
}

export const galleryI18n = I18n.keyset('gallery.view');
export const galleryLandingI18n = I18n.keyset('gallery.landing.view');
export const galleryAllPageI18n = I18n.keyset('gallery.all-page.view');
export const galleryCardPageI18n = I18n.keyset('gallery.card-page.view');
