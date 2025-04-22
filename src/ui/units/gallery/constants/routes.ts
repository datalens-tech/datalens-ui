const PUBLIC_GALLERY_ROOT_ROUTE = '/gallery';

export const UNIT_ROUTE = {
    ROOT: '/',
    ALL: '/all',
    ENTRY: '/:id',
};

export const PUBLIC_GALLERY_ROUTES = [
    `${PUBLIC_GALLERY_ROOT_ROUTE}${UNIT_ROUTE.ROOT}`,
    `${PUBLIC_GALLERY_ROOT_ROUTE}${UNIT_ROUTE.ALL}`,
    `${PUBLIC_GALLERY_ROOT_ROUTE}${UNIT_ROUTE.ENTRY}`,
];
