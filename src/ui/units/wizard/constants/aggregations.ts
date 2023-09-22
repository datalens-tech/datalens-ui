// TODO: abandon the dictionary and take the necessary data from the backend response
const AVAILABLE_AGGREGATIONS_BY_COMMON_CAST = {
    hierarchy: ['hierarchy'],
    string: ['count', 'countunique'],
    number: ['avg', 'count', 'countunique', 'max', 'min', 'sum'],
    date: ['avg', 'count', 'countunique', 'max', 'min'],
    boolean: ['count', 'countunique'],
    geo: ['count', 'countunique'],
    array: ['count', 'countunique'],
    markup: ['count'],
    tree: [],
};

export {AVAILABLE_AGGREGATIONS_BY_COMMON_CAST};
