import {I18N} from '@gravity-ui/i18n';

import en from './keysets/en.js';
import ru from './keysets/ru.js';

const i18nInstance = new I18N();

// equivalent of the previous behavior (undefined -> 'ru')
const defaultLang = 'ru';

i18nInstance.setLang(defaultLang);

i18nInstance.registerKeysets('ru', ru);
i18nInstance.registerKeysets('en', en);

const i18n = i18nInstance.i18n.bind(i18nInstance);

export {i18nInstance as I18N, i18nInstance as I18n, i18n};
