import {EDITOR_TYPE, EditorTemplatesQA} from '../../../../../shared/constants';

export default {
    qa: EditorTemplatesQA.Markup,
    name: 'markup',
    type: EDITOR_TYPE.MARKUP_NODE,
    data: {
        js: `const markup = {
    type: 'concat',
    children: [
        {
            type: 'italics',
            content: {
                type: 'text',
                content: 'Calculating value... ',
            },
        },
        {
            type: 'br',
        },
        {
            type: 'bold',
            content: {
                type: 'text',
                content: 'Total: ',
            },
        },
        {
            type: 'size',
            size: '50%',
            
            content: '1',
        },
        {
            type: 'br',
        },
        {
            type: 'color',
            color: 'red',
            content: {
                type: 'text',
                content: 'ATTENTION: ',
            },
        },
        {
            type: 'bold',
            content: {
                type: 'text',
                content: 'Value is too low',
            },
        },
        {
            type: 'br'
        }
    ],
};

module.exports = {
    value: markup,
};
`,
        url: '',
        params: '',
        shared: '',
    },
};
