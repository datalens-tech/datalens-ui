function defineDataConverter(ymaps) {
    /**
     * Making weighted points array from input data module.
     * @module heatmap.component.dataConverter
     */
    ymaps.modules.define('heatmap.component.dataConverter', [], function (provide) {
        const dataConverter = {};

        /**
         * @public
         * @function convert
         * @description Make weighted points array from input data.
         *
         * @param {Object} data Points described using one of following formats:
         *  IGeoObject, IGeoObject[], ICollection, ICollection[], GeoQueryResult, String|Object.
         * @returns {Array} points Weighted points array.
         */
        dataConverter.convert = function (data) {
            let points = [];

            if (typeof object == 'string') {
                data = JSON.parse(data);
            }

            if (this._isJsonFeatureCollection(data)) {
                for (let i = 0, l = data.features.length; i < l; i++) {
                    points = points.concat(this.convert(data.features[i]));
                }
            } else if (this._isCoordinates(data)) {
                points.push(this._convertCoordinatesToPoint(data));
            } else {
                const dataArray = [].concat(data);
                for (let i = 0, l = dataArray.length, item; i < l; i++) {
                    item = dataArray[i];
                    if (this._isCoordinates(item)) {
                        points.push(this._convertCoordinatesToPoint(item));
                    } else if (this._isJsonGeometry(item) && item.type == 'Point') {
                        points.push(this._convertCoordinatesToPoint(item.coordinates));
                    } else if (this._isJsonFeature(item) && item.geometry.type == 'Point') {
                        points.push(this._convertJsonFeatureToPoint(item));
                    } else if (this._isGeoObject(item) && item.geometry.getType() == 'Point') {
                        points.push(this._convertGeoObjectToPoint(item));
                    } else if (this._isCollection(item)) {
                        const iterator = item.getIterator();
                        let geoObject;
                        while ((geoObject = iterator.getNext()) != iterator.STOP_ITERATION) {
                            // Recursion in the case of nested collections.
                            points = points.concat(this.convert(geoObject));
                        }
                    }
                }
            }
            return points;
        };

        /**
         * @private
         * @function _isJsonFeature
         * @description Checks whether object is a JSON-description or not.
         *
         * @param {Object} object Some object.
         * @returns {Boolean}
         */
        dataConverter._isJsonFeature = function (object) {
            return object.type == 'Feature';
        };

        /**
         * @private
         * @function _convertJsonFeatureToPoint
         * @description Converts JSON "Feature" object to weighted point.
         *
         * @param {JSON} jsonFeature JSON "Feature" object.
         * @returns {Object} Weighted point.
         */
        dataConverter._convertJsonFeatureToPoint = function (jsonFeature) {
            let weight = 1;
            if (jsonFeature.properties && jsonFeature.properties.weight) {
                weight = jsonFeature.properties.weight;
            }
            return {
                coordinates: jsonFeature.geometry.coordinates,
                weight: weight,
            };
        };

        /**
         * @private
         * @function _isJsonFeatureCollection
         * @description Checks whether JSON object is a correct Feature collection description.
         *
         * @param {Object} object Some object.
         * @returns {Boolean}
         */
        dataConverter._isJsonFeatureCollection = function (object) {
            return object.type == 'FeatureCollection';
        };

        /**
         * @private
         * @function _isCoordinates
         * @description Checks whether object is a pair of coordinates.
         *
         * @param {Object} object Some object.
         * @returns {Boolean}
         */
        dataConverter._isCoordinates = function (object) {
            return (
                Object.prototype.toString.call(object) == '[object Array]' &&
                typeof object[0] == 'number' &&
                typeof object[1] == 'number'
            );
        };

        /**
         * @private
         * @function _convertCoordinatesToPoint
         * @description Converts coordinates into weighted point.
         *
         * @param {Number[]} coordinates Coordinates.
         * @returns {Object} Weighted point.
         */
        dataConverter._convertCoordinatesToPoint = function (coordinates) {
            return {
                coordinates: coordinates,
                weight: 1,
            };
        };

        /**
         * @private
         * @function _isJsonGeometry
         * @description Checks whether JSON object is a correct geometry description.
         *
         * @param {Object} object Some object.
         * @returns {Boolean}
         */
        dataConverter._isJsonGeometry = function (object) {
            return Boolean(object.type && object.coordinates);
        };

        /**
         * @private
         * @function _isGeoObject
         * @description Checks whether object implements IGeoObjectInterface.
         *
         * @param {Object} object Some object.
         * @returns {Boolean}
         */
        dataConverter._isGeoObject = function (object) {
            return Boolean(object.geometry && object.getOverlay);
        };

        /**
         * @private
         * @function _convertGeoObjectToPoint
         * @description Converts IGeoObject of Point type into weighted point.
         *
         * @param {IGeoObject} geoObject IGeoObject of Point type.
         * @returns {Object} Weighted point.
         */
        dataConverter._convertGeoObjectToPoint = function (geoObject) {
            return {
                coordinates: geoObject.geometry.getCoordinates(),
                weight: geoObject.properties.get('weight') || 1,
            };
        };

        /**
         * @private
         * @function _isCollection
         * @description Checks whether object implements ICollection interface.
         *
         * @param {Object} object Some object.
         * @returns {Boolean}
         */
        dataConverter._isCollection = function (object) {
            return Boolean(object.getIterator);
        };

        provide(dataConverter);
    });
}

export default defineDataConverter;
