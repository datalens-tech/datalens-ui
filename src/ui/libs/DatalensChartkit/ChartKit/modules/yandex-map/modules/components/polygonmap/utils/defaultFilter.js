/**
 * Function of iterative filter of features.
 *
 * @param {Object} feature Ymaps feature data.
 * @returns {boolean} Saving feature.
 * @this Polygonmap
 */
const defaultFilter = function (feature) {
    return feature.properties.pointsCount > 0;
};

export default defaultFilter;
