import {EDITOR_TYPE} from '../..';
import {EditorTemplatesQA} from '../qa/editor';

export default {
    qa: EditorTemplatesQA.Metric,
    name: 'metric',
    type: EDITOR_TYPE.METRIC_NODE,
    data: {
        js: `const moment = require('vendor/moment/v2.19');
        
const {fields, region, scale, date_min, date_max} = ChartEditor.getParams();

const {report: {values}} = ChartEditor.getLoadedData();

const datas = values.reverse().reduce((datas, value) => {
    fields.forEach((field) => {
        datas[field] = datas[field] || [];
        datas[field].push(value[field]);
    });

    return datas;
}, {});
        
const TITLE_BY_FIELD = {
    visitors: 'Посетители', 
    hits: 'Хиты'
};
        
const metrics = Object.keys(datas).reduce((metrics, key) => {
    const data = datas[key];

    metrics.push({
        title: \`поле: \${key}, регион: \${region}, скейл: \${scale}, период: \${moment(
            date_min,
            'YYYY-MM-DD',
        ).format('DD MMMM YYYY')} - \${moment(date_max, 'YYYY-MM-DD').format('DD MMMM YYYY')}\`,
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
        url: `const moment = require('vendor/moment/v2.19');
        
const Stat = require('libs/stat/v1');

const {fields, region, scale, date_min, date_max} = ChartEditor.getParams();

module.exports = {
    report: Stat.buildReportSource({
        report: '/Morda/Totals/Totals',
        fields,
        region: region[0],
        scale: scale[0],
    })
};
`,
        params: `const moment = require('vendor/moment/v2.19');
        
module.exports = {
    fields: ['hits', 'visitors'],
    region: 'TOT',
    scale: 'd',
    date_min: moment().subtract(2, 'months').format('YYYY-MM-DD'),
    date_max: moment().format('YYYY-MM-DD') 
};
`,
        shared: '',
        statface_metric: '',
    },
};
