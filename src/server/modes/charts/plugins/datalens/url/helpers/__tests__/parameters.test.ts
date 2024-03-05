import type {ServerField} from '../../../../../../../../shared';
import {mapItemToPayloadParameter} from '../parameters';

describe('mapItemToPayloadParameter', () => {
    it('integer parameter with a default value of 0', () => {
        const integerParameter = {
            guid: 'guid',
            default_value: 0,
        } as ServerField;
        const result = mapItemToPayloadParameter(integerParameter);
        expect(result).toEqual({
            id: 'guid',
            value: 0,
        });
    });

    it('boolean parameter with a default value of false', () => {
        const integerParameter = {
            guid: 'guid',
            default_value: false,
        } as ServerField;
        const result = mapItemToPayloadParameter(integerParameter);
        expect(result).toEqual({
            id: 'guid',
            value: false,
        });
    });
});
