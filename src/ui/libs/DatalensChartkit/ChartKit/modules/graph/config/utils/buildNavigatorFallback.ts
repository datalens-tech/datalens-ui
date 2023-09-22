export const buildNavigatorFallback = (graphs: Record<string, any>[], baseSeriesName?: string) => {
    if (baseSeriesName) {
        graphs.forEach((item) => {
            if (typeof item.showInNavigator === 'undefined') {
                item.showInNavigator =
                    item.sname === baseSeriesName ||
                    item.name === baseSeriesName ||
                    item.title === baseSeriesName;
            }
        });
    } else {
        graphs.forEach((item) => {
            item.showInNavigator = true;
        });
    }
};
