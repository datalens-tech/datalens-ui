import {getUtcDateTime} from '../date-time';

describe('getUtcDateTime', function () {
    it.each([
        ['2022-09-01T09:00:00', '2022-09-01T09:00:00.000Z'],
        ['2022-09-01T09:00:00Z', '2022-09-01T09:00:00.000Z'],
    ])(`should return correct ISO string for: %s`, (input, result) => {
        expect(getUtcDateTime(input)?.toISOString()).toEqual(result);
    });
});
