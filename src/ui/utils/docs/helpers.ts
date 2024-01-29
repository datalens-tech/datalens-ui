import {DL} from '../../constants/common';
export const getDocsBaseUrl = () => {
    const {datalensDocs} = DL.ENDPOINTS;

    return datalensDocs || '';
};
