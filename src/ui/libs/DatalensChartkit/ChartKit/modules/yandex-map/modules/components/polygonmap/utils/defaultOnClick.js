/**
 * Default handler for Click event. Creates balloon, opens it with custom content.
 * Changes options for view of object.
 *
 * @param {Object} e Event object.
 * @this Polygonmap
 */
const defaultOnClick = function (e) {
    const objId = e.get('objectId');
    const object = this.objectManager.objects.getById(objId);
    const balloonContent = this.options.get('balloonContent');

    this.balloon.setData({
        content: balloonContent(object),
    });
    this.balloon.open(e.get('coords'));

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
            typeof object.options.fillOpacityActive === 'number'
                ? object.options.fillOpacityActive
                : this.options.get('fillOpacityActive'),
        strokeColor:
            typeof object.options.strokeColorActive === 'number'
                ? object.options.strokeColorActive
                : this.options.get('strokeColorActive'),
        strokeWidth:
            typeof object.options.strokeWidthActive === 'number'
                ? object.options.strokeWidthActive
                : this.options.get('strokeWidthActive'),
    };

    const fillColor = object.options.fillColorActive || this.options.get('fillColorActive');
    if (fillColor) {
        options.fillColor = fillColor;
    }

    this.objectManager.objects.setObjectOptions(objId, options);

    const onClose = () => {
        if (this._prevObjectId) {
            const object = this.objectManager.objects.getById(this._prevObjectId);

            if (object) {
                this.objectManager.objects.setObjectOptions(this._prevObjectId, {
                    fillColor: object.options.fillColorOriginal,
                    fillOpacity: object.options.fillOpacityOriginal,
                    strokeColor: object.options.strokeColorOriginal,
                    strokeWidth: object.options.strokeWidthOriginal,
                });
            }
        }
    };

    onClose();
    this._prevObjectId = objId;

    this.balloon.events.add('close', () => {
        onClose();
        this._prevObjectId = null;
    });
};

export default defaultOnClick;
