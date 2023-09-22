/**
 * Default handler for mouseLeave event.
 *
 * @param {Object} e Event object.
 * @this Polygonmap
 */
const defaultOnMouseLeave = function (e) {
    const objId = e.get('objectId');
    const object = this.objectManager.objects.getById(objId);

    if (this._prevObjectId !== objId) {
        this.objectManager.objects.setObjectOptions(objId, {
            fillColor: object.options.fillColorOriginal,
            fillOpacity: object.options.fillOpacityOriginal,
            strokeColor: object.options.strokeColorOriginal,
            strokeWidth: object.options.strokeWidthOriginal,
        });
    }
};

export default defaultOnMouseLeave;
