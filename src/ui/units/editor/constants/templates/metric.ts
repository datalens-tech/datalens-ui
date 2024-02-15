import {EDITOR_TYPE, EditorTemplatesQA} from '../../../../../shared/constants';

export default {
    qa: EditorTemplatesQA.Metric,
    name: 'metric',
    type: EDITOR_TYPE.METRIC_NODE,
    data: {
        js: `const {fields, region, scale, date_min, date_max} = ChartEditor.getParams();

const values = [
    {
      "hits": 228343352,
      "fielddate__ms": 1586908800000,
      "visitors": 62091842
    },
    {
      "hits": 251689342,
      "fielddate__ms": 1586822400000,
      "visitors": 61782759
    },
    {
      "hits": 237761868,
      "fielddate__ms": 1586736000000,
      "visitors": 62212157
    }
];


const datas = values.reverse().reduce((datas, value) => {
    fields.forEach((field) => {
        datas[field] = datas[field] || [];
        datas[field].push(value[field]);
    });

    return datas;
}, {});
        
const TITLE_BY_FIELD = {
    visitors: 'Visitors', 
    hits: 'Hits'
};
        
const metrics = Object.keys(datas).reduce((metrics, key) => {
    const data = datas[key];

    metrics.push({
        title: "Hits and visitors",
        content: {
            current: { 
                value: data[data.length - 1],
                formatted: true 
            },
            last: {
                    value: data[data.length - 2],
                    formatted: true
            },
            diff: {},
            diffPercent: {}
        },
        chart: {
            graphs: [
                {
                    data: data.slice(0, data.length - 3),
                    type: 'spline'
                }
            ]
        },
        colorize: 'more-green' 
    });
    
    return metrics;
}, []);
        
module.exports = metrics;
`,
        url: '',
        params: `module.exports = {
    fields: ['hits', 'visitors'],
    region: 'TOT',
    scale: 'd'
};
`,
        shared: '',
        statface_metric: '',
    },
};
