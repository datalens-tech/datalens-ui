import {setPointActionParamToParams} from './action-params-handlers';

describe('chartkit/chartkit-adapter/helpers', () => {
    test.each([
        [{actionParams: {p: '2'}, params: {p: '1'}, selected: true}, {p: ['1', '2']}],
        [{actionParams: {p: ['2']}, params: {p: '1'}, selected: true}, {p: ['1', '2']}],
        [{actionParams: {p: '2'}, params: {p: ['1']}, selected: true}, {p: ['1', '2']}],
        [{actionParams: {p: ['2']}, params: {p: ['1']}, selected: true}, {p: ['1', '2']}],
        [{actionParams: {p: '1'}, params: {p: '1'}, selected: true}, {p: '1'}],
        [{actionParams: {p: '1'}, params: {p: ['1']}, selected: true}, {p: ['1']}],
        [{actionParams: {p: ['1']}, params: {p: ['1']}, selected: true}, {p: ['1']}],
        [{actionParams: {p: ['3']}, params: {p: ['1', '2']}, selected: true}, {p: ['1', '2', '3']}],
        [{actionParams: {p: ['2', '3']}, params: {p: '1'}, selected: true}, {p: ['1', '2', '3']}],
        [{actionParams: {p: '1'}, params: {p: '1'}, selected: false}, {p: []}],
        [{actionParams: {p: ['1']}, params: {p: '1'}, selected: false}, {p: []}],
        [{actionParams: {p: '1'}, params: {p: ['1']}, selected: false}, {p: []}],
        [{actionParams: {p: ['1']}, params: {p: ['1']}, selected: false}, {p: []}],
        [{actionParams: {p: ['1']}, params: {p: ['1', '2']}, selected: false}, {p: ['2']}],
        [{actionParams: {p: ['3']}, params: {p: ['1', '2']}, selected: false}, {p: ['1', '2']}],
    ])('setPointsActionParamToParams (args: %j})', (args, expected) => {
        const params = args.params;
        setPointActionParamToParams(args);
        expect(params).toEqual(expected);
    });
});
