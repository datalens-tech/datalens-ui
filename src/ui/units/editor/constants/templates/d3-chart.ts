import {EDITOR_TYPE, EditorTemplatesQA} from '../../../../../shared/constants';

export default {
    qa: EditorTemplatesQA.D3,
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
                type: "bar-x",
                name: "Fruits",
                data: [
                    { x: "Apples", y: 3 },
                    { x: "Oranges", y: 1 },
                    { x: "Grapes", y: 2 },
                ],
            },
        ],
    },
    title: {text: 'Chart title'},
    xAxis: {
        type: "category",
        categories: ["Apples", "Oranges", "Grapes"],
        title: {text: 'X axis title'},
    },
    yAxis: [{
        title: {text: 'Y axis title'},
    }],
};
`,
    },
};
