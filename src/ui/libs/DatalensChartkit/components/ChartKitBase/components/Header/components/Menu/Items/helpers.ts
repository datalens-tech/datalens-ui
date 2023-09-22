import type {Highcharts} from '@gravity-ui/chartkit/highcharts';

type Scale = 's' | 'i' | 'h' | 'd' | 'w' | 'm' | 'q' | 'y';

/**
 * It is not enough to look only at closestPointRange,
 * because there may be a case when closestPointRange equals, for example, 120000,
 * while the X axis does't have fixed step and have non-multiple seconds in timestamps,
 * therefore, the scale should be s, and by closestPointRange % timeUnits[...] will result in i.
 * Therefore, we go through all the points and look for the minimum scale.
 */
export function calculateScale(chart: Highcharts.Chart): Scale {
    const timeUnits: Record<Scale, number> = {
        s: 1000,
        i: 60000,
        h: 3600000,
        d: 86400000,
        w: 604800000,
        m: 2419200000,
        q: 7344000000,
        y: 31449600000,
    };

    let resultScale: Scale = 'y';

    for (const serie of chart.xAxis[0].series) {
        for (const {x} of serie.getValidPoints()) {
            let current: Scale = 's';
            let previous: Scale = 's';

            // eslint-disable-next-line guard-for-in
            for (current in timeUnits) {
                if (x % timeUnits[current] > 0 || timeUnits[current] > timeUnits[resultScale]) {
                    break;
                }
                previous = current;
            }

            if (timeUnits[previous] < timeUnits[resultScale]) {
                resultScale = previous;
            }

            if (resultScale === 's') {
                break;
            }
        }

        if (resultScale === 's') {
            break;
        }
    }

    return resultScale;
}
