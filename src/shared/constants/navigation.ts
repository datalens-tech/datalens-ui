export const PLACE = {
    ROOT: 'navigation',
    FAVORITES: 'favorites',
    DASHBOARDS: 'dashboards',
    DATASETS: 'datasets',
    WIDGETS: 'widgets',
    CONNECTIONS: 'connections',
    CLUSTERS: 'clusters',
    REPORTS: 'reports',
    // TODO delete after update
    PRESENTATIONS: 'presentations',
} as const;

export const MAP_PLACE_TO_SCOPE = {
    [PLACE.ROOT]: 'folder',
    [PLACE.FAVORITES]: 'folder',
    [PLACE.DASHBOARDS]: 'dash',
    [PLACE.DATASETS]: 'dataset',
    [PLACE.WIDGETS]: 'widget',
    [PLACE.CONNECTIONS]: 'connection',
    [PLACE.CLUSTERS]: 'clusters',
    [PLACE.REPORTS]: 'report',
    // TODO delete after update
    [PLACE.PRESENTATIONS]: 'presentations',
} as const;
