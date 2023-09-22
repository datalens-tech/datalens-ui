const DOT_RADIUS = 5;
const DOT_MARGIN = DOT_RADIUS * 3;
const DOT_HALF_MARGIN = DOT_MARGIN / 2;

const HIGHCHARTS_COMMENT = 'highcharts-comment';
const HIGHCHARTS_RENDERER_COMMENT = 'highcharts-renderer-comment';

const DEFAULT_COLOR = '#ffcc00';
const DEFAULT_TEXT_COLOR = 'white';
const DEFAULT_FILL_COLOR = 'black';

const Z_INDEX = 10;

const TYPES = {
    FLAG_X: 'flag-x',
    LINE_X: 'line-x',
    BAND_X: 'band-x',
    DOT_XY: 'dot-x-y',
};
/* eslint-disable complexity */

// getting milliseconds from the date
function convertDateToX(date) {
    return new Date(date).valueOf();
}

// adding the x field (date in milliseconds) to the comments
export function extendComment({meta, ...rest}, chart) {
    const extended = Object.assign({}, rest, meta);

    const {
        userOptions: {_config: {comments: {ignoreScale} = {}} = {}},
        xAxis: [xAxis],
    } = chart;

    if (extended.dateUntil) {
        extended.from = convertDateToX(extended.date);
        extended.to = convertDateToX(extended.dateUntil);
    } else if (extended.date) {
        extended.x = convertDateToX(extended.date);
    }

    let isFit;
    if (extended.x) {
        isFit = extended.x >= xAxis.min && extended.x <= xAxis.max;
        /**
         * @deprecated
         * ignoreScale: false only for compatibility with logic,
         * when it is not necessary to display comments that do not fit into the scale
         */
        if (ignoreScale === false && isFit) {
            isFit = xAxis.series.some(({xData}) => xData.indexOf(extended.x) !== -1);
        }
    } else {
        isFit = extended.from <= xAxis.max && extended.to >= xAxis.min;
        /**
         * @deprecated
         * ignoreScale: false only for compatibility with logic,
         * when it is not necessary to display comments that do not fit into the scale
         */
        if (ignoreScale === false && isFit) {
            isFit = xAxis.series.some(({xData}) =>
                xData.some((x) => extended.from <= x && x <= extended.to),
            );
        }
    }
    extended.isFit = isFit;

    return extended;
}

// TODO: add a title and a separate text output in the tooltip by hovering over the flag, as in Highcharts
function drawFlagX(chart, {isFit, x, text, y, shape, color = DEFAULT_COLOR}) {
    if (!isFit) {
        return;
    }

    chart.addSeries(
        {
            className: HIGHCHARTS_COMMENT,
            type: 'flags',
            data: [{x, text, title: text}],
            y: y || -30,
            shape: shape || 'circlepin',
            color,
            // lineWidth: 2,
            showInLegend: false,
            zIndex: Z_INDEX,
        },
        false,
        false,
    );
}

function drawLineX(chart, {isFit, x, color = DEFAULT_COLOR, width, dashStyle, text}) {
    if (!isFit) {
        return;
    }

    const line = chart.xAxis[0].addPlotLine({
        className: HIGHCHARTS_COMMENT,
        value: x,
        color,
        width: width || 2,
        dashStyle,
        label: {
            className: HIGHCHARTS_COMMENT,
            text,
        },
        id: Math.random().toFixed(3).toString(), // TODO: Is it necessary?
        zIndex: Z_INDEX,
    });

    // TODO: className doesn't work in addPlotLine, so (6.1.0) (it seems to work in the Highcharts version with CSS styles)
    line.svgElem.element.classList.add(HIGHCHARTS_COMMENT);
}

function drawBandX(chart, options, onlyRenderer) {
    if (!options.isFit) {
        return;
    }

    const xAxis = chart.xAxis[0];
    const yAxis = chart.yAxis[0];
    const xExtremes = xAxis.getExtremes();
    const yExtremes = yAxis.getExtremes();

    let from;
    let to;
    let xFromPx;
    let yFromPx;
    let width = 0;

    let half;

    while (Math.abs(width) < 3) {
        half = half === undefined ? xAxis.closestPointRange / 2 : half * 1.5;

        from = Math.max(options.from || options.x, xExtremes.dataMin) - half;
        to = Math.min(options.to || options.x, xExtremes.dataMax) + half;

        xFromPx = Math.max(xAxis.toPixels(from), chart.plotLeft);
        yFromPx = yAxis.toPixels(yExtremes.max);
        const xToPx = Math.min(xAxis.toPixels(to), chart.plotLeft + chart.plotWidth);
        width = xToPx - xFromPx;
    }

    if (options.visible && !onlyRenderer) {
        xAxis.addPlotBand({
            from: from,
            to: to,
            color: options.color || DEFAULT_COLOR,
            zIndex: options.zIndex || 0,
            className: ' highcharts-plot-band_comment ' + HIGHCHARTS_COMMENT,
        });
    }

    // yFromPx can be NaN if all rows are hidden
    if (yFromPx) {
        chart.renderer
            .rect(xFromPx, yFromPx, width, 4, 0)
            .attr({
                fill: options.color || DEFAULT_COLOR,
                zIndex: 1,
                opacity: 0.8,
                class: HIGHCHARTS_RENDERER_COMMENT,
            })
            .add();
    }
}

function getDotLabelPositions(options) {
    const width = options.width;
    const height = options.height;
    const pointX = options.pointX;
    const pointY = options.pointY;
    const plotRight = options.plotRight;
    const plotBottom = options.plotBottom;

    const widthPlusMargin = width + DOT_MARGIN;
    const widthMinusMargin = width - DOT_MARGIN;
    const heightPlusMargin = height + DOT_MARGIN;
    const heightMinusMargin = height - DOT_MARGIN;

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const positions = [];

    let x;
    let y;
    let anchor;

    // top
    if (pointY > heightPlusMargin) {
        y = pointY - heightPlusMargin;
        anchor = [
            'M',
            pointX,
            pointY - DOT_HALF_MARGIN,
            'L',
            pointX - DOT_RADIUS,
            pointY - DOT_MARGIN,
            pointX + DOT_RADIUS,
            pointY - DOT_MARGIN,
            'Z',
        ];

        // top-left
        if (pointX > widthMinusMargin) {
            positions.push({
                x: pointX - widthMinusMargin,
                y: y,
                w: width,
                h: height,
                anchor: anchor,
            });
        }

        // top-right
        if (pointX + widthMinusMargin < plotRight) {
            positions.push({
                x: pointX - DOT_MARGIN,
                y: y,
                w: width,
                h: height,
                anchor: anchor,
            });
        }

        // top-mid
        if (pointX > halfWidth && pointX + halfWidth < plotRight) {
            positions.push({
                x: pointX - halfWidth,
                y: y,
                w: width,
                h: height,
                anchor: anchor,
            });
        }
    }

    // right
    if (pointX + widthPlusMargin < plotRight) {
        x = pointX + DOT_MARGIN;
        anchor = [
            'M',
            pointX + DOT_HALF_MARGIN,
            pointY,
            'L',
            pointX + DOT_MARGIN,
            pointY + DOT_RADIUS,
            pointX + DOT_MARGIN,
            pointY - DOT_RADIUS,
            'Z',
        ];

        // right-top
        if (pointY > heightMinusMargin) {
            positions.push({
                x: x,
                y: pointY - heightMinusMargin,
                w: width,
                h: height,
                anchor: anchor,
            });
        }

        // right-bottom
        if (pointY + heightMinusMargin < plotBottom) {
            positions.push({
                x: x,
                y: pointY - DOT_MARGIN,
                w: width,
                h: height,
                anchor: anchor,
            });
        }

        // right-mid
        if (pointY > halfHeight && pointY + halfHeight < plotBottom) {
            positions.push({
                x: x,
                y: pointY - halfHeight,
                w: width,
                h: height,
                anchor: anchor,
            });
        }
    }

    // bottom
    if (pointY + heightPlusMargin < plotBottom) {
        y = pointY + DOT_MARGIN;
        anchor = [
            'M',
            pointX,
            pointY + DOT_HALF_MARGIN,
            'L',
            pointX - DOT_RADIUS,
            pointY + DOT_MARGIN,
            pointX + DOT_RADIUS,
            pointY + DOT_MARGIN,
            'Z',
        ];

        // bottom-left
        if (pointX > widthMinusMargin) {
            positions.push({
                x: pointX - widthMinusMargin,
                y: y,
                w: width,
                h: height,
                anchor: anchor,
            });
        }

        // bottom-right
        if (pointX + widthMinusMargin < plotRight) {
            positions.push({
                x: pointX - DOT_MARGIN,
                y: y,
                w: width,
                h: height,
                anchor: anchor,
            });
        }

        // bottom-mid
        if (pointX > halfWidth && pointX + halfWidth < plotRight) {
            positions.push({
                x: pointX - halfWidth,
                y: y,
                w: width,
                h: height,
                anchor: anchor,
            });
        }
    }

    // left
    if (pointX > widthPlusMargin) {
        x = pointX - widthPlusMargin;
        anchor = [
            'M',
            pointX - DOT_HALF_MARGIN,
            pointY,
            'L',
            pointX - DOT_MARGIN,
            pointY + DOT_RADIUS,
            pointX - DOT_MARGIN,
            pointY - DOT_RADIUS,
            'Z',
        ];

        // left-top
        if (pointY > heightMinusMargin) {
            positions.push({
                x: x,
                y: pointY - heightMinusMargin,
                w: width,
                h: height,
                anchor: anchor,
            });
        }

        // left-bottom
        if (pointY + heightMinusMargin < plotBottom) {
            positions.push({
                x: x,
                y: pointY - DOT_MARGIN,
                w: width,
                h: height,
                anchor: anchor,
            });
        }

        // left-mid
        if (pointY > halfHeight && pointY + halfHeight < plotBottom) {
            positions.push({
                x: x,
                y: pointY - halfHeight,
                w: width,
                h: height,
                anchor: anchor,
            });
        }
    }

    return positions;
}

function drawDot(chart, options) {
    if (!options.isFit) {
        return;
    }

    const seriesIndex = chart.series.findIndex(
        ({name, userOptions: {id}, visible}) => options.graphId === (id || name) && visible,
    );

    if (seriesIndex === -1) {
        return null;
    }

    const point = chart.series[seriesIndex].data.find((_point) => _point && _point.x === options.x);
    const color = options.color || chart.series[seriesIndex].color;

    if (!point) {
        return null;
    }

    point.update(
        {
            marker: {
                enabled: true,
                radius: DOT_RADIUS,
                fillColor: color,
                states: {
                    hover: {
                        // radius: DOT_RADIUS,
                        fillColor: color,
                    },
                },
            },
        },
        false,
        false,
    );
}

// TODO: try annotations
function drawDotLabel(chart, options) {
    if (!options.visible || !options.isFit) {
        return null;
    }

    const seriesIndex = chart.series.findIndex(
        ({name, userOptions: {id}, visible}) => options.graphId === (id || name) && visible,
    );

    if (seriesIndex === -1) {
        return null;
    }

    // getValidPoints for the case of Highstock c dataGrouping, to populate everything with a point.plotX parameter
    const point = chart.series[seriesIndex]
        .getValidPoints()
        .find((_point) => _point && _point.x === options.x);

    if (!point) {
        return null;
    }

    const pointX = point.plotX + chart.plotLeft;
    const pointY = point.plotY + chart.plotTop;

    // adding label to get label.width and label.height
    // next, need to make label.translate(...)
    const label = chart.renderer
        .label(options.text, pointX, pointY, 'callout')
        .css({
            color: options.textColor || DEFAULT_TEXT_COLOR,
            width: 150,
            fontSize: 10,
        })
        .attr({
            fill: options.fillColor || DEFAULT_FILL_COLOR,
            padding: 8,
            opacity: 0.7,
            r: 8,
            zIndex: 6,
            class: HIGHCHARTS_RENDERER_COMMENT,
        })
        .add();

    const positions = getDotLabelPositions({
        width: label.width,
        height: label.height,
        pointX: pointX,
        pointY: pointY,
        plotRight: chart.plotWidth + chart.plotLeft,
        plotBottom: chart.plotHeight + chart.plotTop,
    });

    if (positions.length === 0) {
        label.destroy();
        return null;
    }

    return {label: label, positions: positions, fillColor: options.fillColor};
}

function isRectsIntersects(ax1, ax2, ay1, ay2, bx1, bx2, by1, by2) {
    return ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1;
}

function translateDotsLabels(chart, notTranslatedDotsLabels) {
    const translatedDotsLabels = [];

    notTranslatedDotsLabels
        .sort((a, b) => {
            return a.label.x - b.label.x;
        })
        .forEach((label, index) => {
            // array of label positions available for placement
            const available = label.positions
                .map((position) => {
                    return {
                        // number of intersections with translated labels
                        previous: translatedDotsLabels.filter((translated) => {
                            return isRectsIntersects(
                                position.x,
                                position.x + position.w,
                                position.y,
                                position.y + position.h,
                                translated.x,
                                translated.x + translated.w,
                                translated.y,
                                translated.y + translated.h,
                            );
                        }).length,

                        // the number of intersections with all possible positions of notTranlated labels,
                        // whose dot (dot to which the label belongs) located inside the label being processed
                        next: notTranslatedDotsLabels
                            // the remaining untranslated labels
                            .slice(index + 1, notTranslatedDotsLabels.length)
                            // the dot is located inside the label being processed
                            .filter((notTranslated) => {
                                return (
                                    notTranslated.label.x > position.x &&
                                    notTranslated.label.x < position.x + position.w &&
                                    notTranslated.label.y > position.y &&
                                    notTranslated.label.y < position.y + position.h
                                );
                            })
                            .map((notTranslated) => {
                                // take positions that intersect with the current one
                                return notTranslated.positions.filter((notPosition) => {
                                    return isRectsIntersects(
                                        notPosition.x,
                                        notPosition.x + notPosition.w,
                                        notPosition.y,
                                        notPosition.y + notPosition.h,
                                        position.x,
                                        position.x + position.w,
                                        position.y,
                                        position.y + position.h,
                                    );
                                }).length;
                            })
                            .reduce((sum, current) => {
                                return sum + current;
                            }, 0),

                        position: position,
                    };
                })
                .sort((a, b) => {
                    return a.previous === b.previous ? a.next - b.next : a.previous - b.previous;
                });

            label.label.translate(available[0].position.x, available[0].position.y);

            // adding an "arrow" from the label to the dot
            chart.renderer
                .path(available[0].position.anchor)
                .attr({
                    strokeWidth: 1,
                    stroke: label.fillColor || DEFAULT_FILL_COLOR,
                    fill: label.fillColor || DEFAULT_FILL_COLOR,
                    opacity: 0.7,
                    zIndex: 6,
                    class: HIGHCHARTS_RENDERER_COMMENT,
                })
                .add();

            translatedDotsLabels.push({
                x: available[0].position.x,
                y: available[0].position.y,
                w: available[0].position.w,
                h: available[0].position.h,
            });
        });
}

export function drawComments(chart, comments, settings, force) {
    if (force) {
        settings.hideComments = false;
    } else if (settings.hideComments) {
        return;
    }

    if (comments) {
        const notTranslatedDotsLabels = [];

        comments.forEach((comment) => {
            const extendedComment = extendComment(comment, chart);

            switch (comment.type) {
                case TYPES.FLAG_X:
                    drawFlagX(chart, extendedComment);
                    break;
                case TYPES.LINE_X:
                    drawLineX(chart, extendedComment);
                    break;
                case TYPES.BAND_X:
                    drawBandX(chart, extendedComment, false);
                    break;
                case TYPES.DOT_XY: {
                    drawDot(chart, extendedComment);

                    const metaDotLabel = drawDotLabel(chart, extendedComment);

                    if (metaDotLabel) {
                        notTranslatedDotsLabels.push(metaDotLabel);
                    }
                    break;
                }
            }
        });

        translateDotsLabels(chart, notTranslatedDotsLabels);

        if (
            comments.some(
                (comment) => comment.type === TYPES.DOT_XY || comment.type === TYPES.FLAG_X,
            )
        ) {
            chart.redraw();
        }
    }
}

export function drawOnlyRendererComments(chart, comments = [], settings) {
    if (settings.hideComments) {
        return;
    }

    const notTranslatedDotsLabels = [];

    if (comments && comments.length && chart.container) {
        chart.container
            .querySelectorAll(`.${HIGHCHARTS_RENDERER_COMMENT}`)
            .forEach((elem) => elem.remove());

        comments.forEach((comment) => {
            const extendedComment = extendComment(comment, chart);

            switch (comment.type) {
                case TYPES.BAND_X:
                    drawBandX(chart, extendedComment, true);
                    break;
                case TYPES.DOT_XY: {
                    const metaDotLabel = drawDotLabel(chart, extendedComment);
                    if (metaDotLabel) {
                        notTranslatedDotsLabels.push(metaDotLabel);
                    }
                    break;
                }
            }
        });

        translateDotsLabels(chart, notTranslatedDotsLabels);
    }
}

export function hideComments(chart, comments, settings, force) {
    // TODO: need a separate method for hide|show = redraw
    // chart check, because while the form is open, the chart can be updated
    if (chart && chart.container && comments && comments.length) {
        chart.container.querySelectorAll(`.${HIGHCHARTS_COMMENT}`).forEach((elem) => elem.remove());
        chart.container
            .querySelectorAll(`.${HIGHCHARTS_RENDERER_COMMENT}`)
            .forEach((elem) => elem.remove());
        chart.series.forEach(
            (serie) => serie.options.type === 'flags' && serie.remove(false, false, false),
        );

        comments.forEach((comment) => {
            const extendedComment = extendComment(comment, chart);

            if (extendedComment.type === TYPES.DOT_XY) {
                const seriesIndex = chart.series.findIndex(
                    (graph) => (graph.userOptions.id || graph.name) === extendedComment.graphId,
                );

                if (seriesIndex !== -1) {
                    const point = chart.series[seriesIndex].data.find(
                        (_point) => _point && _point.x === extendedComment.x,
                    );
                    if (point) {
                        point.update({marker: {}}, false, false);
                    }
                }
            }
        });

        if (force) {
            settings.hideComments = true;
        }

        chart.redraw();
    }
}

export function getCommentsOnLine(xLine, comments, chart) {
    const xComments = [];
    const xyComments = [];

    if (comments) {
        comments.forEach((_comment) => {
            const comment = extendComment(_comment, chart);
            if (comment.x && comment.x === xLine.x) {
                if (comment.graphId) {
                    xyComments[comment.graphId] = {text: comment.text};
                } else {
                    const text = comment.title
                        ? comment.title + '\r\n' + (comment.text || '')
                        : comment.text;

                    xComments.push({text: text, color: comment.color || DEFAULT_COLOR});
                }
            } else if (
                comment.from &&
                comment.from <= xLine.x &&
                xLine.x <= comment.to &&
                comment.isFit
            ) {
                xComments.push({text: comment.text, color: comment.color || DEFAULT_COLOR});
            }
        });
    }

    return {xComments, xyComments};
}
