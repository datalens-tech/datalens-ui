import type {AppContext} from '@gravity-ui/nodekit';

import type {BaseStorageInitParams, EmbedResolveConfigProps, ResolveConfigProps} from './base';
import type {EmbeddingInfo, ResolvedConfig} from './types';
import {UnitedStorage} from './united-storage';
import {USProvider} from './united-storage/provider';

let storage: UnitedStorage;

export function initStorage(data: BaseStorageInitParams) {
    storage = new UnitedStorage(USProvider);
    storage.init(data);
}

export function resolveConfig(
    ctx: AppContext,
    options: ResolveConfigProps,
): Promise<ResolvedConfig> {
    return storage.resolveConfig(ctx, options);
}

export function resolveEmbedConfig(
    ctx: AppContext,
    options: EmbedResolveConfigProps,
): Promise<EmbeddingInfo> {
    return storage.resolveEmbedConfig(ctx, options);
}

export function initPreloading(ctx: AppContext) {
    ctx.log('ChartsEngine: initializing config preloading');
    return storage && storage.initPreloading(ctx, (preloaded) => storage.setPreloaded(preloaded));
}
