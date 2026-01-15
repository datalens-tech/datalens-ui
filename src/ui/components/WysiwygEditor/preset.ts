// @ts-nocheck
import {wysiwygToolbarConfigs} from '@gravity-ui/markdown-editor';
import type {ExtensionAuto, ToolbarsPreset} from '@gravity-ui/markdown-editor';
import {ActionName as BaseAction} from '@gravity-ui/markdown-editor/_/bundle/config/action-names';
import {Math} from '@gravity-ui/markdown-editor/_/extensions/additional/Math';
import {Mermaid} from '@gravity-ui/markdown-editor/_/extensions/additional/Mermaid';
import {
    ListName as BaseList,
    ToolbarName,
} from '@gravity-ui/markdown-editor/_/modules/toolbars/constants';
import {
    mathBlockItemView,
    mathBlockItemWysiwyg,
    mathInlineItemMarkup,
    mathInlineItemView,
    mathInlineItemWysiwyg,
    mermaidItemMarkup,
    mermaidItemView,
    mermaidItemWysiwyg,
} from '@gravity-ui/markdown-editor/_/modules/toolbars/items';
import {full} from '@gravity-ui/markdown-editor/_/modules/toolbars/presets';

export const DATALENS_PRESET: ExtensionAuto = (builder) => {
    builder
        .use(Math, {
            loadRuntimeScript: () => {
                import('@diplodoc/latex-extension/runtime');
            },
            sanitize: undefined,
        })
        .use(Mermaid, {
            loadRuntimeScript: () => {
                import('@diplodoc/mermaid-extension/runtime');
            },
        });
};

const ALLOWED_COMMAND_ITEMS = [
    BaseAction.paragraph,
    BaseAction.heading1,
    BaseAction.heading2,
    BaseAction.heading3,
    BaseAction.heading4,
    BaseAction.heading5,
    BaseAction.heading6,
    BaseAction.bulletList,
    BaseAction.orderedList,
    BaseAction.link,
    BaseAction.quote,
    BaseAction.yfm_note,
    BaseAction.yfm_cut,
    BaseAction.code_block,
    BaseAction.table,
    BaseAction.image,
    BaseAction.horizontalrule,
    BaseAction.emoji,
];

const ALLOWED_SELECTION_ITEMS = [
    'folding-heading',
    'text',
    BaseAction.colorify,
    BaseAction.bold,
    BaseAction.italic,
    BaseAction.strike,
    BaseAction.underline,
    BaseAction.mono,
    BaseAction.mark,
    BaseAction.code_inline,
];

// in wisywig mode, the selection menu opens if you select text
export const SELECTION_MENU_ACTIONS = wysiwygToolbarConfigs.wSelectionMenuConfig
    .map((group) => group.filter((item) => ALLOWED_SELECTION_ITEMS.includes(item.id)))
    .filter((group) => group.length);

// in wisywig mode, the command menu opens if you type '/'
export const COMMAND_MENU_ACTIONS = wysiwygToolbarConfigs.wCommandMenuConfig.filter((item) =>
    ALLOWED_COMMAND_ITEMS.includes(item.id),
);

export const getBaseHiddenItems = () => {
    return [BaseAction.horizontalRule, BaseAction.emoji];
};

export const getExtendedHiddenItems = () => {
    return [
        ...getBaseHiddenItems(),
        BaseAction.tabs,
        BaseAction.mathInline,
        BaseAction.mathBlock,
        BaseAction.mermaid,
    ];
};

export const TOOLBARS_PRESET: ToolbarsPreset = {
    items: {
        ...full.items,
        [BaseAction.mathInline]: {
            view: mathInlineItemView,
            wysiwyg: mathInlineItemWysiwyg,
            markup: mathInlineItemMarkup,
        },
        [BaseAction.mathBlock]: {
            view: mathBlockItemView,
            wysiwyg: mathBlockItemWysiwyg,
            markup: mathInlineItemMarkup,
        },
        [BaseAction.mermaid]: {
            view: mermaidItemView,
            wysiwyg: mermaidItemWysiwyg,
            markup: mermaidItemMarkup,
        },
    },
    orders: {
        [ToolbarName.wysiwygMain]: [
            [BaseAction.undo, BaseAction.redo],
            [
                BaseAction.bold,
                BaseAction.italic,
                BaseAction.underline,
                BaseAction.strike,
                BaseAction.mono,
                BaseAction.mark,
            ],
            [
                {
                    id: BaseList.heading,
                    items: [
                        BaseAction.paragraph,
                        BaseAction.heading1,
                        BaseAction.heading2,
                        BaseAction.heading3,
                        BaseAction.heading4,
                        BaseAction.heading5,
                        BaseAction.heading6,
                    ],
                },
                {
                    id: BaseList.lists,
                    items: [
                        BaseAction.bulletList,
                        BaseAction.orderedList,
                        BaseAction.sinkListItem,
                        BaseAction.liftListItem,
                    ],
                },
                BaseAction.colorify,
                BaseAction.link,
                BaseAction.note,
                BaseAction.cut,
                BaseAction.quote,
                {
                    id: BaseList.code,
                    items: [BaseAction.codeInline, BaseAction.codeBlock],
                },
            ],
            [BaseAction.image, BaseAction.table],
        ],
        [ToolbarName.markupMain]: [
            [BaseAction.undo, BaseAction.redo],
            [
                BaseAction.bold,
                BaseAction.italic,
                BaseAction.underline,
                BaseAction.strike,
                BaseAction.mono,
                BaseAction.mark,
            ],
            [
                {
                    id: BaseList.heading,
                    items: [
                        BaseAction.paragraph,
                        BaseAction.heading1,
                        BaseAction.heading2,
                        BaseAction.heading3,
                        BaseAction.heading4,
                        BaseAction.heading5,
                        BaseAction.heading6,
                    ],
                },
                {
                    id: BaseList.lists,
                    items: [
                        BaseAction.bulletList,
                        BaseAction.orderedList,
                        BaseAction.sinkListItem,
                        BaseAction.liftListItem,
                    ],
                },
                BaseAction.colorify,
                BaseAction.link,
                BaseAction.note,
                BaseAction.cut,
                BaseAction.quote,
                {
                    id: BaseList.code,
                    items: [BaseAction.codeInline, BaseAction.codeBlock],
                },
            ],
            [BaseAction.imagePopup, BaseAction.table],
        ],
        [ToolbarName.wysiwygHidden]: [getBaseHiddenItems()],
        [ToolbarName.markupHidden]: [getBaseHiddenItems()],
    },
};
