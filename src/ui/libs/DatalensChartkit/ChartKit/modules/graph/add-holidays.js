import {registry} from '../../../../../registry';

const HALF_DAY = 43200000;

const calculateConsistentClosestPointRange = (type, closestPointRange, series) => {
    const isDatetimeAxis = type === 'datetime';

    return (
        isDatetimeAxis &&
        closestPointRange === 86400000 &&
        series.every(({xData}) => {
            let consistent = true;
            for (let i = 2; i < xData.length - 1; i++) {
                if ((xData[i] - xData[i - 1]) % closestPointRange !== 0) {
                    consistent = false;
                    break;
                }
            }
            return consistent;
        })
    );
};

export function addHolidays(chart) {
    const holidays = registry.chart.functions.get('getChartkitHolidays');
    if (!holidays) {
        return;
    }
    const {
        userOptions: {_config: {region: configRegion = 'TOT'} = {}},
        xAxis: [xAxis],
    } = chart;

    const {dataMin, dataMax, closestPointRange, series} = xAxis;
    const isConsistentClosestPointRange = calculateConsistentClosestPointRange(
        xAxis.options.type,
        closestPointRange,
        series,
    );

    let needRedraw = false;

    if (isConsistentClosestPointRange) {
        const region = configRegion.toLowerCase();

        for (let passed = 0; dataMin + passed <= dataMax; passed += closestPointRange) {
            const timestamp = dataMin + passed;

            const pointDate = Number(chart.time.dateFormat('%Y%m%d', timestamp));

            const holidayByRegion = holidays.holiday[region];
            const weekendByRegion = holidays.weekend[region];

            if (
                (holidayByRegion && holidayByRegion[pointDate]) ||
                (weekendByRegion && weekendByRegion[pointDate])
            ) {
                const bandStart = timestamp - HALF_DAY;
                const bandStop = timestamp + HALF_DAY;

                xAxis.addPlotBand({
                    color: 'var(--highcharts-holiday-band)',
                    from: bandStart,
                    to: bandStop,
                });

                needRedraw = true;
            }
        }
    }

    return needRedraw;
}
