import isEqual from 'lodash/isEqual';

export default class Example {
    static isEqualProps = isEqual;

    static async getData() {
        // Promise only for demo ChartKit
        return new Promise((resolve) => {
            setTimeout(
                () =>
                    resolve({
                        config: {
                            precision: 2,
                        },
                        libraryConfig: {
                            xAxis: {
                                type: 'datetime',
                                startOnTick: false,
                                endOnTick: false,
                            },
                        },
                        widgetType: 'graph',
                        data: [
                            {
                                data: [
                                    [1517356800000, 1.0001],
                                    [1517443200000, 2.02],
                                    [1517529600000, 3],
                                ],
                            },
                        ],
                    }),
                300,
            );
        });
    }

    static getRequestCancellation() {}
}
