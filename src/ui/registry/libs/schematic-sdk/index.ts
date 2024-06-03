import type {SchemasByScope} from '@gravity-ui/gateway';

import type {DatalensSdk} from '../../../libs/schematic-sdk';

let datalensSdk: DatalensSdk<any> | undefined;

export const schematicSdk = {
    register<T extends SchemasByScope>(sdk: DatalensSdk<T>, override?: boolean) {
        if (datalensSdk && !override) {
            throw new Error('Datalens sdk must be inited only once');
        }
        datalensSdk = sdk;
    },
    get(): DatalensSdk<any> {
        if (!datalensSdk) {
            throw new Error('Datalens sdk is not inited');
        }
        return datalensSdk;
    },
};
