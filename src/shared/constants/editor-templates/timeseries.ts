import {EDITOR_TYPE} from '../..';
import {EditorTemplatesQA} from '../qa/editor';

export default {
    qa: EditorTemplatesQA.Timeseries,
    name: 'timeseries',
    type: EDITOR_TYPE.TIMESERIES_NODE,
    data: {
        js: `module.exports = {
    graphs: [
        { name: 'A', color: '#4da2f1', data: [1, 2, 3] },
        { name: 'B', color: '#ff3d64', data: [3, 2, 2] },
    ],
    timeline: [0, 1000, 2000],
};
`,
        ui: '',
        url: '',
        graph: `module.exports = {
    scales: {},
    axes: {},
};
`,
        params: '',
        shared: '',
        statface_graph: '',
    },
};
