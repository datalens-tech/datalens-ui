import {DL} from 'ui';

export const getPassportLink = (pathname = '') => {
    return `${DL.ENDPOINTS.passportHost}${pathname}`;
};

export const getDatalensDocLink = (pathname = '') => {
    const {datalensDocsRu, datalensDocsEn} = DL.ENDPOINTS;
    return `${DL.USER_LANG === 'ru' ? datalensDocsRu : datalensDocsEn}${pathname}`;
};
