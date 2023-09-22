/**
 * Default handler for mouseEnter event.
 *
 * @param {Object} e Event object.
 * @this Polygonmap
 */
const defaultOnMouseEnter = function (e) {
    const objId = e.get('objectId');

    if (this._prevObjectId !== objId) {
        const object = this.objectManager.objects.getById(objId);

        const options = {
            fillColorOriginal: object.options.fillColor || this.options.get('fillColor'),

            fillOpacityOriginal:
                typeof object.options.fillOpacity === 'number'
                    ? object.options.fillOpacity
                    : this.options.get('fillOpacity'),
            strokeColorOriginal:
                typeof object.options.strokeColor === 'number'
                    ? object.options.strokeColor
                    : this.options.get('strokeColor'),
            strokeWidthOriginal:
                typeof object.options.strokeWidth === 'number'
                    ? object.options.strokeWidth
                    : this.options.get('strokeWidth'),

            fillOpacity:
                typeof object.options.fillOpacityHover === 'number'
                    ? object.options.fillOpacityHover
                    : this.options.get('fillOpacityHover'),
            strokeColor:
                typeof object.options.strokeColorHover === 'number'
                    ? object.options.strokeColorHover
                    : this.options.get('strokeColorHover'),
            strokeWidth:
                typeof object.options.strokeWidthHover === 'number'
                    ? object.options.strokeWidthHover
                    : this.options.get('strokeWidthHover'),
        };

        const fillColor = object.options.fillColorHover || this.options.get('fillColorHover');
        if (fillColor) {
            options.fillColor = fillColor;
        }

        this.objectManager.objects.setObjectOptions(objId, options);
    }
};

export default defaultOnMouseEnter;
