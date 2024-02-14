import {EDITOR_TYPE} from '../..';
import {EditorTemplatesQA} from '../qa/editor';

export default {
    qa: EditorTemplatesQA.Table,
    name: 'table',
    type: EDITOR_TYPE.TABLE_NODE,
    data: {
        js: `const moment = require('vendor/moment/v2.21');
        
const params = ChartEditor.getParams();
        
const head = [
    {
        id: 'uid',
        name: 'Текст',
        type: 'text',
        isLink: true,
        css: {
            color: '#CC263C',
            'font-weight': 'bold'
        }
    },
    {
        id: 'date',
        name: 'Дата',
        type: 'date',
    },
    {
        name: 'Двухуровневая',
        sub: [
            {
                id: 'rand-int',
                name: 'Число',
                type: 'number',
                precision: 2,
                formatter: {
                    multiplier: 10000000
                }
            },
            {
                id: 'rand-float',
                name: 'Разница',
                type: 'diff_only',
                diff_formatter: {
                    precision: 3
                }
            }
        ]
    },
    {
        id: 'random-diff',
        name: 'Дифф',
        type: 'diff',
        precision: 2,
        formatter: {
            multiplier: 100
        },
        diff_formatter: {
            multiplier: 100
        }
    }
];
            
const rows = [];
        
for (var i = 0; i < params.count; i++) {
    rows.push({
        values: [
            Math.random().toString(16).substring(2), 
            Number(moment.utc('01.01.2016', 'DD.MM.YYYY').format('x')) + Math.random() * Math.pow(10, 11), 
            Math.random(), 
            Math.random() > 0.5 ? -Math.random() : Math.random(), 
            [
                Math.random() > 0.5 ? -Math.random() : Math.random(), 
                Math.random() > 0.5 ? -Math.random() : Math.random()
            ]
        ]
    });
            
    rows.push({
        cells: [
            {
                value: Math.random().toString(16).substring(2),
                link: {href: 'https://ya.ru'}
            },
            {
                value: Number(moment.utc('01.01.2016', 'DD.MM.YYYY').format('x')) + Math.random() * Math.pow(10, 11),
                css: { 
                    'color': '#ffffff',
                    'background-color': 'rgb(' + Math.floor(Math.random() * 255) + ',' 
                        + Math.floor(Math.random() * 255) + ','
                        + Math.floor(Math.random() * 255) + ')' 
                }
            },
            {
                value: Math.random(),
                css: { 
                    'color': 'rgb(' + Math.floor(Math.random() * 255) + ',' 
                        + Math.floor(Math.random() * 255) + ','
                        + Math.floor(Math.random() * 255) + ')' 
                }
            },
            {
                value: Math.random() > 0.5 ? -Math.random() : Math.random()
            },
            {
                value: [
                    Math.random() > 0.5 ? -Math.random() : Math.random(), 
                   Math.random() > 0.5 ? -Math.random() : Math.random()
                ]
            }
        ]
    });
}
        
module.exports = {head, rows};
`,
        ui: '',
        url: '',
        table: `module.exports = {
    title: {
        text: 'Таблица со случайными данными',
        style: {
            'text-align': 'center',
            'font-size': '16px',
            'color': '#31C733'
        }
    },
    sort: 'date',
    order: 'asc'
};
`,
        params: `module.exports = {
    count: 8
};
`,
        shared: '',
    },
};
