import type {Source, SourceConfig, SourceWithAPIConnector} from '../../types';
import {convertToAPIConnectorSource, shouldUseAlias} from '../processor/source-alias';
import {
    getApiConnectorParamsFromSource,
    isAPIConnectorSource,
    prepareSource,
} from '../processor/sources';

describe('source-alias: legacy source to API Connector conversion', () => {
    const aliasConfig: SourceConfig = {
        dataEndpoint: 'https://api.example.com/v2',
        passedCredentials: {cookie: true, oauth: true},
        allowedMethods: ['GET'],
        aliasTo: {apiConnectionId: 'test-connection-id'},
    };

    describe('convertToAPIConnectorSource', () => {
        test('converts legacy URL to API Connector format', () => {
            const result = convertToAPIConnectorSource(
                {url: '/_example/issues?filter=open&page=1'},
                aliasConfig,
            );

            expect(result.apiConnectionId).toBe('test-connection-id');
            expect(result.method).toBe('GET');
            expect(result.path).toBe('/issues?filter=open&page=1');
            expect(result.url).toBeUndefined();
            expect(isAPIConnectorSource(result)).toBe(true);
        });

        test('uses source method when specified', () => {
            const result = convertToAPIConnectorSource(
                {url: '/_example/issues', method: 'POST'},
                {...aliasConfig, allowedMethods: ['GET', 'POST']},
            );

            expect(result.method).toBe('POST');
        });

        test('uses first allowedMethod from config as default', () => {
            const result = convertToAPIConnectorSource(
                {url: '/_api/data'},
                {...aliasConfig, allowedMethods: ['POST', 'GET']},
            );

            expect(result.method).toBe('POST');
        });

        test('falls back to GET when allowedMethods is undefined', () => {
            const result = convertToAPIConnectorSource(
                {url: '/_api/data'},
                {...aliasConfig, allowedMethods: undefined},
            );

            expect(result.method).toBe('GET');
        });

        test('works with prepareSource pipeline', () => {
            const result = convertToAPIConnectorSource({url: '/_example/issues'}, aliasConfig);

            const prepared = prepareSource(result);
            expect(prepared.url).toBe('/_bi_connections/test-connection-id/typed_query_raw');

            // Double prepareSource must preserve _original
            const prepared2 = prepareSource(prepared) as SourceWithAPIConnector;
            expect((prepared2._original as Source).method).toBe('GET');
            expect(getApiConnectorParamsFromSource(prepared2).method).toBe('GET');
        });
    });

    describe('shouldUseAlias', () => {
        const enabledFlag = () => true;

        test('returns true when aliasTo exists and no OAuth header', () => {
            expect(shouldUseAlias({url: '/_example/issues'}, aliasConfig, enabledFlag)).toBe(true);
        });

        test('skips alias for explicit OAuth header', () => {
            const source: Source = {
                url: '/_example/issues',
                headers: {authorization: 'OAuth my-secret-token'},
            };

            expect(shouldUseAlias(source, aliasConfig, enabledFlag)).toBe(false);
        });

        test('enable alias for non-OAuth Authorization headers', () => {
            const source: Source = {
                url: '/_example/issues',
                headers: {authorization: 'Bearer some-token'},
            };

            expect(shouldUseAlias(source, aliasConfig, enabledFlag)).toBe(true);
        });

        test('skips alias for OAuth header with capital Authorization', () => {
            const source: Source = {
                url: '/_example/issues',
                headers: {Authorization: 'OAuth my-secret-token'},
            };

            expect(shouldUseAlias(source, aliasConfig, enabledFlag)).toBe(false);
        });

        test('returns false when aliasTo is not defined', () => {
            expect(
                shouldUseAlias(
                    {url: '/_example/issues'},
                    {dataEndpoint: 'https://api.example.com/v2'},
                    enabledFlag,
                ),
            ).toBe(false);
        });
    });
});
