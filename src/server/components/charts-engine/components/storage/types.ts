import type {
    ControlType,
    DashData,
    EntryPublicAuthor,
    EntryScope,
    WorkbookId,
} from '../../../../../shared';
import type {ChartStorageType} from '../../types';
import type {ChartTemplates} from '../chart-generator';

export type PublicAuthorData = {text?: string; link?: string};

export type ResolvedConfig = {
    entryId: string;
    data: {
        js: string;
        documentation_en: string;
        documentation_ru: string;
        shared: string;
        ui: string;
        url: string;
        graph: string;
        params: string;
        statface_graph: string;
        map?: string;
        ymap?: string;
    };
    key: string;
    links?: string[];
    meta: {
        is_release?: boolean;
        stype: ChartStorageType | ControlType.Dash;
        owner?: string;
        sandbox_version?: string;
    };
    permissions: {execute: boolean; read: boolean; edit: boolean; admin: boolean};
    scope: EntryScope;
    type: string;
    public: false;
    isFavorite?: boolean;
    revId: string;
    savedId: string;
    publishedId: string;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
    workbookId: WorkbookId;
    template?: keyof ChartTemplates;
    owner?: string;
    publicAuthor?: EntryPublicAuthor;
};

export type ReducedResolvedConfig = ResolvedConfig & {data: {shared: string | object}};

export type EmbeddingInfo = {
    token: EmbeddingToken;
    embed: {
        embedId: string;
        title: string;
        embeddingSecretId: string;
        entryId: string;
        depsIds: string[];
        unsignedParams: string[];
        privateParams: string[];
        createdBy: string;
        createdAt: string;
        publicParamsMode: boolean;
        settings: {
            enableExport?: boolean;
        };
    };
    entry: ChartEntryData | DashEntryData;
};

export type ChartEntryData = ResolvedConfig & {
    scope: EntryScope.Widget;
};

export type DashEntryData = ResolvedConfig & {data: DashData; scope: EntryScope.Dash};

type EmbeddingToken = {
    embedId: string;
    iat: number;
    exp: number;
    params: Record<string, unknown>;
};
