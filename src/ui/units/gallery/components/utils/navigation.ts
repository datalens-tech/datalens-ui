import {UNIT_ROUTE} from '../../constants/routes';
import {CARD_PAGE_URL_PARAMS, URL_FILTER_PARAMS} from '../pages/constants';

export function getAllPageUrl(filters: {category?: string} = {}) {
    const searchParams = new URLSearchParams();
    if (filters.category) {
        searchParams.append(URL_FILTER_PARAMS.CATEGORY, filters.category);
    }

    return `${UNIT_ROUTE.ALL}?${searchParams}`;
}

export function getGalleryItemUrl({id, preview}: {id: string; preview?: boolean}) {
    const searchParams = new URLSearchParams();
    if (preview) {
        searchParams.append(CARD_PAGE_URL_PARAMS.PREVIEW, '1');
    }

    let result = `${UNIT_ROUTE.ROOT}/${id}`;
    if (searchParams.size) {
        result += `?${searchParams}`;
    }

    return result;
}
