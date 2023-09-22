import {getIconLevel} from './getIconLevel';

describe('getIconLevel', () => {
    it('returns null when the array is empty', () => {
        expect(getIconLevel([])).toBeNull();
    });

    it('return the level of the first element', () => {
        expect(
            getIconLevel([
                {
                    title: 'title',
                    message: 'message',
                    locator: '1',
                    level: 'critical',
                },
            ]),
        ).toEqual('critical');

        expect(
            getIconLevel([
                {
                    title: 'title',
                    message: 'message',
                    locator: '1',
                    level: 'info',
                },
            ]),
        ).toEqual('info');

        expect(
            getIconLevel([
                {
                    title: 'title',
                    message: 'message',
                    locator: '1',
                    level: 'warning',
                },
            ]),
        ).toEqual('warning');
    });

    it('returns critical level', () => {
        expect(
            getIconLevel([
                {
                    title: 'title',
                    message: 'message',
                    locator: '1',
                    level: 'critical',
                },
                {
                    title: 'title',
                    message: 'message',
                    locator: '2',
                    level: 'warning',
                },
            ]),
        ).toEqual('critical');

        expect(
            getIconLevel([
                {
                    title: 'title',
                    message: 'message',
                    locator: '1',
                    level: 'warning',
                },
                {
                    title: 'title',
                    message: 'message',
                    locator: '2',
                    level: 'critical',
                },
            ]),
        ).toEqual('critical');

        expect(
            getIconLevel([
                {
                    title: 'title',
                    message: 'message',
                    locator: '1',
                    level: 'warning',
                },
                {
                    title: 'title',
                    message: 'message',
                    locator: '2',
                    level: 'critical',
                },
                {
                    title: 'title',
                    message: 'message',
                    locator: '3',
                    level: 'warning',
                },
            ]),
        ).toEqual('critical');
    });

    it('returns warning level', () => {
        expect(
            getIconLevel([
                {
                    title: 'title',
                    message: 'message',
                    locator: '1',
                    level: 'info',
                },
                {
                    title: 'title',
                    message: 'message',
                    locator: '2',
                    level: 'warning',
                },
            ]),
        ).toEqual('warning');

        expect(
            getIconLevel([
                {
                    title: 'title',
                    message: 'message',
                    locator: '1',
                    level: 'warning',
                },
                {
                    title: 'title',
                    message: 'message',
                    locator: '2',
                    level: 'info',
                },
            ]),
        ).toEqual('warning');

        expect(
            getIconLevel([
                {
                    title: 'title',
                    message: 'message',
                    locator: '1',
                    level: 'info',
                },
                {
                    title: 'title',
                    message: 'message',
                    locator: '2',
                    level: 'info',
                },
                {
                    title: 'title',
                    message: 'message',
                    locator: '3',
                    level: 'warning',
                },
            ]),
        ).toEqual('warning');
    });
});
