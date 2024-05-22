import {EDITOR_TYPE, EditorTemplatesQA} from '../../../../../shared/constants';

export default {
    qa: EditorTemplatesQA.Selector,
    name: 'control',
    type: EDITOR_TYPE.CONTROL_NODE,
    data: {
        ui: `module.exports = [
    {
        type: 'select',
        param: 'scale',
        content: [
            {title: 'Daily', value: 'd'},
            {title: 'Weekly', value: 'w'},
            {title: 'Monthly', value: 'm'}
        ],
        // updateOnChange: true,
        // updateControlsOnChange: true,
        // required: true,
    },
    {
        type: 'input',
        param: 'input',
        innerLabel: 'Search',
        placeholder: 'Query',
        // updateOnChange: true,
        // updateControlsOnChange: true,
        // required: true,
    },
    {
        type: 'datepicker',
        param: 'datepicker',
        innerLabel: 'Date',
        // updateOnChange: true,
        // updateControlsOnChange: true,
        // required: true,
    },
    {
        type: 'range-datepicker',
        paramFrom: 'rangeDatepickerFrom',
        paramTo: 'rangeDatepickerTo',
        innerLabel: 'Calendar',
        // updateOnChange: true,
        // updateControlsOnChange: true,
        // required: true,
    },
    {
        type: 'checkbox',
        param: 'checkbox',
        label: 'Verify',
        // updateOnChange: true,
        // updateControlsOnChange: true,
    },
    {
        type: 'button',
        label: 'Go',
        theme: 'action',
        updateOnChange: true,
    }
];
`,
        url: '',
        params: `module.exports = {
    input: ['Lorem ipsum'],
    checkbox: ['true'],
    scale: ['d']
};
`,
        shared: '',
    },
};
