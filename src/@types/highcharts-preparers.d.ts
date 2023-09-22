import 'highcharts';

declare module 'highcharts' {
    interface PointOptionsObject {
        colorValue?: string;
        colorGuid?: string;
    }

    interface SeriesOptions {
        colorGuid?: string;
        colorValue?: string;
        legendTitle?: string;
        formattedName?: string;
    }

    interface Point {
        userOptions: {
            legendTitle: string;
            formattedName?: string;
        };
        yLabel: string;
    }

    interface Series {
        userOptions: {
            legendTitle: string;
        };
    }

    interface Axis {
        closestPointRange: number;
    }
}
