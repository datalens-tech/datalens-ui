// Take all the values along the X axis and sort them by decreasing
// We are looking for the two nearest points - this will be the closestPointRange for highcharts
// Based on this, highcharts correctly calculates the dimensions.
export function calculateClosestPointManually(this: any): number | undefined {
    const series = this.series;

    const xValues: number[] = series.reduce((values: number[], currSeries: any) => {
        return values.concat(currSeries.processedXData);
    }, []);

    xValues.sort((a, b) => b - a);

    let closestPointRange: number | undefined;

    xValues.forEach((xValue: number, index: number) => {
        const nextXValue = xValues[index + 1];

        if (nextXValue) {
            const distance = xValue - nextXValue;

            if (
                distance > 0 &&
                (typeof closestPointRange === 'undefined' || distance < closestPointRange)
            ) {
                closestPointRange = distance;
            }
        }
    });

    return closestPointRange;
}
