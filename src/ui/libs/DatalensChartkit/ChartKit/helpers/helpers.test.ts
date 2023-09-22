import {setPointActionParamToParams} from './apply-hc-handlers';

describe('chartkit/chartkit-adapter/helpers', () => {
    test.each([
        [{actionParam: {p: '2'}, params: {p: '1'}, selected: true}, {p: ['1', '2']}],
        [{actionParam: {p: ['2']}, params: {p: '1'}, selected: true}, {p: ['1', '2']}],
        [{actionParam: {p: '2'}, params: {p: ['1']}, selected: true}, {p: ['1', '2']}],
        [{actionParam: {p: ['2']}, params: {p: ['1']}, selected: true}, {p: ['1', '2']}],
        [{actionParam: {p: '1'}, params: {p: '1'}, selected: true}, {p: '1'}],
        [{actionParam: {p: '1'}, params: {p: ['1']}, selected: true}, {p: ['1']}],
        [{actionParam: {p: ['1']}, params: {p: ['1']}, selected: true}, {p: ['1']}],
        [{actionParam: {p: ['3']}, params: {p: ['1', '2']}, selected: true}, {p: ['1', '2', '3']}],
        [{actionParam: {p: ['2', '3']}, params: {p: '1'}, selected: true}, {p: ['1', '2', '3']}],
        [{actionParam: {p: '1'}, params: {p: '1'}, selected: false}, {p: []}],
        [{actionParam: {p: ['1']}, params: {p: '1'}, selected: false}, {p: []}],
        [{actionParam: {p: '1'}, params: {p: ['1']}, selected: false}, {p: []}],
        [{actionParam: {p: ['1']}, params: {p: ['1']}, selected: false}, {p: []}],
        [{actionParam: {p: ['1']}, params: {p: ['1', '2']}, selected: false}, {p: ['2']}],
        [{actionParam: {p: ['3']}, params: {p: ['1', '2']}, selected: false}, {p: ['1', '2']}],
    ])('setPointsActionParamToParams (args: %j})', (args, expected) => {
        const params = args.params;
        setPointActionParamToParams(args);
        expect(params).toEqual(expected);
    });
});
