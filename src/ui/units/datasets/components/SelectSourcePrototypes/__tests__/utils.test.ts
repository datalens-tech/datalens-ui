import {getClickableTypes} from '../utils';

const GET_CLICKABLE_TYPES_ARGS_1 = {
    id: '1',
    items: [{id: '1', replacement_types: [{conn_type: 'type1'}, {conn_type: 'type2'}]}],
};
const GET_CLICKABLE_TYPES_ARGS_2 = {
    id: '2',
    items: [
        {id: '1', replacement_types: [{conn_type: 'type1'}]},
        {id: '2', replacement_types: [{conn_type: 'type2'}]},
    ],
};
const GET_CLICKABLE_TYPES_ARGS_3 = {
    id: '2',
    items: [{id: '1', replacement_types: [{conn_type: 'type1'}]}],
};
const GET_CLICKABLE_TYPES_ARGS_4 = {id: '1', items: []};
const GET_CLICKABLE_TYPES_ARGS_5 = {id: '1'};
const GET_CLICKABLE_TYPES_ARGS_6 = {};

// to clarify cases 3-6 with colleagues from the backend
describe('datasets/components/SelectSourcePrototypes/utils', () => {
    test.each<any>([
        [GET_CLICKABLE_TYPES_ARGS_1, ['type1', 'type2']],
        [GET_CLICKABLE_TYPES_ARGS_2, ['type2']],
        [GET_CLICKABLE_TYPES_ARGS_3, undefined],
        [GET_CLICKABLE_TYPES_ARGS_4, undefined],
        [GET_CLICKABLE_TYPES_ARGS_5, undefined],
        [GET_CLICKABLE_TYPES_ARGS_6, undefined],
    ])('getClickableTypes (args: %j)', (args, expected) => {
        const {id, items} = args;
        const result = getClickableTypes(id, items as Parameters<typeof getClickableTypes>[1]);
        expect(result).toEqual(expected);
    });
});
