import type {
    EDITOR_TYPE_CONFIG_TABS,
    EntryPublicAuthor,
    EntryScope,
    WorkbookId,
} from '../../../../../shared';
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
        is_release: boolean;
        stype: keyof typeof EDITOR_TYPE_CONFIG_TABS;
        owner: string;
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
