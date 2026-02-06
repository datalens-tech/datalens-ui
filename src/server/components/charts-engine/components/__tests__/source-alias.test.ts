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
            const source: Source = {url: '/_startrek/issues'};
            const result = convertLegacySourceToAPIConnector(source, aliasConfig);

            expect(result.apiConnectionId).toBe('test-connection-id');
            expect(result.method).toBe('GET');
            expect(result.path).toBe('/issues');
        });

        test('preserves query string in path', () => {
            const source: Source = {url: '/_startrek/issues?filter=open&page=1'};
            const result = convertLegacySourceToAPIConnector(source, aliasConfig);

            expect(result.path).toBe('/issues?filter=open&page=1');
        });

        test('uses source method when specified', () => {
            const source: Source = {url: '/_startrek/issues', method: 'POST'};
            const configWithPost: SourceConfig = {
                ...aliasConfig,
                allowedMethods: ['GET', 'POST'],
            };
            const result = convertLegacySourceToAPIConnector(source, configWithPost);

            expect(result.method).toBe('POST');
        });

        test('defaults method to GET when not specified', () => {
            const source: Source = {url: '/_startrek/issues'};
            const result = convertLegacySourceToAPIConnector(source, aliasConfig);

            expect(result.method).toBe('GET');
        });

        test('removes url field from converted source', () => {
            const source: Source = {url: '/_startrek/issues'};
            const result = convertLegacySourceToAPIConnector(source, aliasConfig);

            expect(result.url).toBeUndefined();
        });

        test('converted source passes isAPIConnectorSource check', () => {
            const source: Source = {url: '/_startrek/issues'};
            const result = convertLegacySourceToAPIConnector(source, aliasConfig);

            expect(isAPIConnectorSource(result)).toBe(true);
        });

        test('converted source works with prepareSource', () => {
            const source: Source = {url: '/_startrek/issues'};
            const result = convertLegacySourceToAPIConnector(source, aliasConfig);
            const prepared = prepareSource(result);

            expect(prepared.url).toBe('/_bi_connections/test-connection-id/typed_query_raw');
            expect(prepared.method).toBe('POST');
        });
    });

    describe('shouldUseAlias', () => {
        test('returns true when aliasTo exists and no OAuth header', () => {
            const {shouldUseAlias} = require('../processor/source-alias');
            const source: Source = {url: '/_startrek/issues'};

            expect(shouldUseAlias(source, aliasConfig)).toBe(true);
        });

        test('returns false when source has explicit OAuth header', () => {
            const {shouldUseAlias} = require('../processor/source-alias');
            const source: Source = {
                url: '/_startrek/issues',
                headers: {authorization: 'OAuth my-secret-token'},
            };

            expect(shouldUseAlias(source, aliasConfig)).toBe(false);
        });

        test('returns false when aliasTo is not defined', () => {
            const {shouldUseAlias} = require('../processor/source-alias');
            const source: Source = {url: '/_startrek/issues'};
            const configWithoutAlias: SourceConfig = {
                dataEndpoint: 'https://st-api.yandex-team.ru/v2',
            };

            expect(shouldUseAlias(source, configWithoutAlias)).toBe(false);
        });

        test('returns true when Authorization header is not OAuth', () => {
            const {shouldUseAlias} = require('../processor/source-alias');
            const source: Source = {
                url: '/_startrek/issues',
                headers: {authorization: 'Bearer some-token'},
            };

            expect(shouldUseAlias(source, aliasConfig)).toBe(true);
        });
    });
});
