// with sankey, the shared type must be set to false, otherwise the tooltip behaves incorrectly:
// * if you hover over an empty area, the tooltip of any of the fields is shown
// * Point.onMouseOver -> Highcharts.Pointer.runPointActions -> H.Tooltip.refresh -> Cannot read property 'series' of undefined
// with xrange, the shared type must be set to false, otherwise the tooltip does not disappear on mouseout

export const isTooltipShared = (chartType: string) => {
    if (['sankey', 'xrange'].includes(chartType)) {
        return false;
    }

    return true;
};
