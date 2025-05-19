import {UNIT_ROUTE} from '../../constants/routes';
import {URL_FILTER_PARAMS} from '../pages/constants';

export function getAllPageUrl(filters: {category?: string}) {
    const searchParams = new URLSearchParams();
    if (filters.category) {
        searchParams.append(URL_FILTER_PARAMS.CATEGORY, filters.category);
    }

    return `${UNIT_ROUTE.ALL}?${searchParams}`;
}
