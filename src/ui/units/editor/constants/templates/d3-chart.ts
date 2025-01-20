import {EDITOR_TYPE, EditorTemplatesQA} from '../../../../../shared/constants';

export default {
    qa: EditorTemplatesQA.GravityCharts,
    name: 'd3',
    type: EDITOR_TYPE.D3_NODE,
    data: {
        js: `module.exports = {
    chart: {
        margin: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10,
        }
    },
    series: {
        data: [
            {
                type: 'bar-x',
                name: 'Fruits',
                data: [
                    // x - index for value from xAxis.categories array, y - point value
                    {x: 0, y: 3},
                    {x: 1, y: 1},
                    {x: 2, y: 2},
                ],
            },
        ],
    },
    title: {text: 'Chart title'},
    xAxis: {
        type: 'category',
        categories: ['Apples', 'Oranges', 'Grapes'],
        title: {text: 'X axis title'},
    },
    yAxis: [{
        title: {text: 'Y axis title'},
    }],
};
`,
    },
};
