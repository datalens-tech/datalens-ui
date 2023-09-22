import {DL} from '../../constants/common';
export const getDocsBaseUrl = () => {
    const {datalensDocsEn, datalensDocsRu} = DL.ENDPOINTS;

    if (!datalensDocsRu && !datalensDocsEn) {
        return '';
    }

    return DL.USER_LANG === 'ru' ? datalensDocsRu : datalensDocsEn;
};
