import type {Source, SourceConfig} from '../../types';
import {isAPIConnectorSource, prepareSource} from '../processor/sources';

function convertLegacySourceToAPIConnector(source: Source, sourceConfig: SourceConfig): Source {
    const {convertToAPIConnectorSource} = require('../processor/source-alias');
    return convertToAPIConnectorSource(source, sourceConfig);
}

describe('source-alias: legacy source to API Connector conversion', () => {
    const aliasConfig: SourceConfig = {
        dataEndpoint: 'https://st-api.yandex-team.ru/v2',
        passedCredentials: {cookie: true, oauth: true},
        allowedMethods: ['GET'],
        aliasTo: {apiConnectionId: 'test-connection-id'},
    };

    describe('convertToAPIConnectorSource', () => {
        test('converts legacy URL to API Connector format', () => {
            const result = convertLegacySourceToAPIConnector(
                {url: '/_startrek/issues?filter=open&page=1'},
                aliasConfig,
            );

            expect(result.apiConnectionId).toBe('test-connection-id');
            expect(result.method).toBe('GET');
            expect(result.path).toBe('/issues?filter=open&page=1');
            expect(result.url).toBeUndefined();
            expect(isAPIConnectorSource(result)).toBe(true);
        });

        test('uses source method when specified', () => {
            const result = convertLegacySourceToAPIConnector(
                {url: '/_startrek/issues', method: 'POST'},
                {...aliasConfig, allowedMethods: ['GET', 'POST']},
            );

            expect(result.method).toBe('POST');
        });

        test('uses first allowedMethod from config as default', () => {
            const result = convertLegacySourceToAPIConnector(
                {url: '/_api/data'},
                {...aliasConfig, allowedMethods: ['POST', 'GET']},
            );

            expect(result.method).toBe('POST');
        });

        test('falls back to GET when allowedMethods is undefined', () => {
            const result = convertLegacySourceToAPIConnector(
                {url: '/_api/data'},
                {...aliasConfig, allowedMethods: undefined},
            );

            expect(result.method).toBe('GET');
        });

        test('works with prepareSource pipeline', () => {
            const {getApiConnectorParamsFromSource} = require('../processor/sources');
            const result = convertLegacySourceToAPIConnector(
                {url: '/_startrek/issues'},
                aliasConfig,
            );

            const prepared = prepareSource(result);
            expect(prepared.url).toBe('/_bi_connections/test-connection-id/typed_query_raw');

            // Double prepareSource must preserve _original
            const prepared2 = prepareSource(prepared);
            expect((prepared2._original as Source).method).toBe('GET');
            expect(getApiConnectorParamsFromSource(prepared2).method).toBe('GET');
        });
    });

    describe('shouldUseAlias', () => {
        const enabledFlag = () => true;

        test('returns true when aliasTo exists and no OAuth header', () => {
            const {shouldUseAlias} = require('../processor/source-alias');

            expect(shouldUseAlias({url: '/_startrek/issues'}, aliasConfig, enabledFlag)).toBe(true);
        });

        test('skips alias for explicit OAuth header', () => {
            const {shouldUseAlias} = require('../processor/source-alias');
            const source: Source = {
                url: '/_startrek/issues',
                headers: {authorization: 'OAuth my-secret-token'},
            };

            expect(shouldUseAlias(source, aliasConfig, enabledFlag)).toBe(false);
        });

        test('enable alias for non-OAuth Authorization headers', () => {
            const {shouldUseAlias} = require('../processor/source-alias');
            const source: Source = {
                url: '/_startrek/issues',
                headers: {authorization: 'Bearer some-token'},
            };

            expect(shouldUseAlias(source, aliasConfig, enabledFlag)).toBe(true);
        });

        test('returns false when aliasTo is not defined', () => {
            const {shouldUseAlias} = require('../processor/source-alias');

            expect(
                shouldUseAlias(
                    {url: '/_startrek/issues'},
                    {dataEndpoint: 'https://st-api.yandex-team.ru/v2'},
                    enabledFlag,
                ),
            ).toBe(false);
        });
    });
});
