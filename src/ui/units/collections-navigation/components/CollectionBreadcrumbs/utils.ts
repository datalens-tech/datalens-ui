import type {GetCollectionBreadcrumbsResponse} from '../../../../../shared/schema';

export const cutBreadcrumbs = (id: string, breadcrumbs: GetCollectionBreadcrumbsResponse) => {
    let isFound = false;

    const result = breadcrumbs.reduce<GetCollectionBreadcrumbsResponse>((acc, item) => {
        if (!isFound) {
            acc.push(item);
        }
        if (id === item.collectionId) {
            isFound = true;
        }
        return acc;
    }, []);

    return result;
};
