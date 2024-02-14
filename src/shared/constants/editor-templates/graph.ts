import {EDITOR_TYPE} from '../..';
import {EditorTemplatesQA} from '../qa/editor';

export default {
    qa: EditorTemplatesQA.Graph,
    name: 'graph',
    type: EDITOR_TYPE.GRAPH_NODE,
    data: {
        js: `module.exports = [
    {
        name: 'Хиты',
        color: 'blue',
        data: [
            {x: 1558915200000, y: 1165523823},
            {x: 1559520000000, y: 1133116710},
            {x: 1560124800000, y: 1123291656},
            {x: 1560729600000, y: 1121243848},
            {x: 1561334400000, y: 1087321487},
            {x: 1561939200000, y: 1040769052},
            {x: 1562544000000, y: 1020165485},
            {x: 1563148800000, y: 1025767527},
            {x: 1563753600000, y: 1110052273}
        ]
    },
    {
        name: 'Посетители',
        color: 'red',
        data: [
            [1558915200000, 188814404],
            [1559520000000, 175231136],
            [1560124800000, 174662930],
            [1560729600000, 178893842],
            [1561334400000, 188372995],
            [1561939200000, 184635961],
            [1562544000000, 175918510],
            [1563148800000, 175513443],
            [1563753600000, 186931298]
        ]
    }
];
`,
        ui: '',
        url: '',
        graph: `module.exports = {
    title: {
        text: 'Morda/Totals/Totals'
    },
    xAxis: {
        type: 'datetime',
        endOnTick: false,
        startOnTick: false
    },
    yAxis: {
        plotLines: [{
            color: 'green',
            zIndex: 5,
            width: 2,
            dashStyle: 'ShortDash',
            value: 900000000,
            label: {
                text: 'goal (=900mil)',
                verticalAlign: 'middle',
                textAlign: 'left',
                x: 0,
                style: {
                    color: 'green',
                    'font-size': '14px',
                    'font-weight': 'bold'
                }
            }
        }]
    },
    plotOptions: {
        series: {
            dataLabels: {
                enabled: true,
                formatter: function () {
                    if (this.point.index === this.series.data.length - 1) {
                        return new Intl.NumberFormat().format(this.y);
                    }
                }
            }
        }
    }
};
`,
        params: '',
        shared: '',
        statface_graph: '',
    },
};
