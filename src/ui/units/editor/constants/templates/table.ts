import {EDITOR_TYPE, EditorTemplatesQA} from '../../../../../shared/constants';

export default {
    qa: EditorTemplatesQA.Table,
    name: 'table',
    type: EDITOR_TYPE.TABLE_NODE,
    data: {
        js: `const params = ChartEditor.getParams();

const head = [
    {
        id: 'uid',
        name: 'Text',
        type: 'text',
        css: {
            color: '#CC263C',
            'font-weight': 'bold'
        }
    },
    {
        id: 'date',
        name: 'Date',
        type: 'date',
    },
    {
        name: 'Two levels',
        sub: [
            {
                id: 'rand-int',
                name: 'Number',
                type: 'number',
                precision: 2,
                formatter: {
                    multiplier: 10000000
                }
            },
            {
                id: 'rand-float',
                name: 'Diff',
                type: 'diff_only',
            }
        ]
    },
    {
        id: 'random-diff',
        name: 'Diff',
        type: 'diff',
        precision: 2,
        formatter: {
            multiplier: 100
        }
    }
];

const rows = [];

for (var i = 0; i < params.count; i++) {
    rows.push({
        values: [
            Math.random().toString(16).substring(2),
            Date.now(),
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
                link: {href: 'https://google.com'}
            },
            {
                value: Date.now(),
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
        text: 'Table with random data',
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
