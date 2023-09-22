export default {
    colorAxis: {
        type: 'logarithmic',
        minColor: '#ffffff',
        maxColor: '#1A47AE',
        tickPixelInterval: 200,
    },
    legend: {
        symbolWidth: 400,
    },
    plotOptions: {
        map: {
            joinBy: 'geo_id',
            states: {
                hover: {
                    color: '#ffeba0',
                },
            },
            dataLabels: {
                style: {
                    color: '#000000',
                    fontSize: '11px',
                    fontWeight: 'normal',
                    textShadow: '0 0 2px contrast',
                },
            },
        },
    },
    exporting: {buttons: {contextButton: {enabled: false}}},
};
