import React from 'react';

import {MermaidRuntime} from '@diplodoc/mermaid-extension/react';
import {
    MarkdownEditorView,
    configure as configureMarkdownEditor,
    useMarkdownEditor,
    wysiwygToolbarConfigs,
} from '@gravity-ui/markdown-editor';
import type {
    ExtensionAuto,
    Lang,
    MarkdownEditorMode,
    MarkdownEditorViewProps,
    MarkdownEditorWysiwygConfig,
    ToolbarsPreset,
    UseMarkdownEditorProps,
} from '@gravity-ui/markdown-editor';
import {WysiwygEditorQa} from 'shared';
import {DL} from 'ui/constants/common';

import {
    COMMAND_MENU_ACTIONS,
    DATALENS_PRESET,
    SELECTION_MENU_ACTIONS,
    TOOLBARS_PRESET,
    getExtendedHiddenItems,
} from './preset';

const lang = DL.USER_LANG;
configureMarkdownEditor({lang: lang as Lang});

const COMMAND_MENU_EXTENSIONS_ACTIONS = [
    wysiwygToolbarConfigs.wMathInlineItemData,
    wysiwygToolbarConfigs.wMathBlockItemData,
    wysiwygToolbarConfigs.wMermaidItemData,
    wysiwygToolbarConfigs.wTabsItemData,
];

const INITIAL_EDITOR_MODE: MarkdownEditorMode = 'wysiwyg';

type MarkdownEditorRef = MarkdownEditorViewProps['editor'] & {
    domElem: () => HTMLElement | null;
};

type MarkdownEditorProps = {
    className?: string;
    autofocus?: boolean;
    onEditorTypeChange?: (type: MarkdownEditorMode) => void;
    onSubmit?: (editor: MarkdownEditorRef) => void;
    onCancel?: (editor: MarkdownEditorRef) => void;
    onMarkupChange?: (editor: MarkdownEditorRef, type: MarkdownEditorMode) => void;
    enableExtensions?: boolean;
    customPreset?: ExtensionAuto;
    customToolbarsPreset?: ToolbarsPreset;
    customExtensionOptions?: MarkdownEditorWysiwygConfig['extensionOptions'];
} & UseMarkdownEditorProps;

const MarkdownEditorDefault = React.forwardRef<MarkdownEditorRef, MarkdownEditorProps>(
    (
        {
            className,
            autofocus,
            onMarkupChange,
            onEditorTypeChange,
            onCancel,
            onSubmit,
            enableExtensions,
            customPreset,
            customToolbarsPreset,
            customExtensionOptions,
            ...props
        },
        ref,
    ) => {
        const toolbarsPreset = customToolbarsPreset ?? TOOLBARS_PRESET;

        const {extendedCommandMenuActions, extendedToolbarsPreset} = React.useMemo(() => {
            if (enableExtensions)
                return {
                    extendedCommandMenuActions: COMMAND_MENU_ACTIONS.concat(
                        COMMAND_MENU_EXTENSIONS_ACTIONS,
                    ),
                    extendedToolbarsPreset: {
                        ...toolbarsPreset,
                        orders: {
                            ...toolbarsPreset.orders,
                            wysiwygHidden: [getExtendedHiddenItems()],
                            markupHidden: [getExtendedHiddenItems()],
                        },
                    },
                };

            return {
                extendedCommandMenuActions: COMMAND_MENU_ACTIONS,
                extendedToolbarsPreset: toolbarsPreset,
            };
        }, [enableExtensions, toolbarsPreset]);

        const editor = useMarkdownEditor({
            wysiwygConfig: {
                extensionOptions: {
                    commandMenu: {actions: extendedCommandMenuActions},
                    selectionContext: {config: SELECTION_MENU_ACTIONS},
                    clipboard: {
                        /**
                         * Passing undefined does not disable the file insertion functionality via ctrl/cmd+v,
                         * you must pass an empty function
                         */
                        pasteFileHandler: () => {},
                    },
                    ...customExtensionOptions,
                },
                extensions: customPreset ?? DATALENS_PRESET,
            },
            md: {html: false, breaks: false, ...props.md},
            initial: {toolbarVisible: true, mode: INITIAL_EDITOR_MODE},
            ...props,
        });

        const viewRef = React.useRef<HTMLDivElement>(null);
        const self = React.useMemo<MarkdownEditorRef>(() => {
            (editor as MarkdownEditorRef).domElem = () => viewRef.current;
            return editor as MarkdownEditorRef;
        }, [editor]);

        React.useImperativeHandle(ref, () => self, [self]);

        React.useLayoutEffect(() => {
            if (!onEditorTypeChange) {
                return undefined;
            }
            const cb = ({mode}: {mode: MarkdownEditorMode}) => {
                onEditorTypeChange(mode);
            };
            self.on('change-editor-mode', cb);
            return () => {
                self.off('change-editor-mode', cb);
            };
        }, [onEditorTypeChange, self]);

        React.useLayoutEffect(() => {
            if (!onMarkupChange) {
                return undefined;
            }
            const cb = () => {
                onMarkupChange(self, self.currentMode);
            };
            self.on('change', cb);
            return () => {
                self.off('change', cb);
            };
        }, [onMarkupChange, self]);

        React.useLayoutEffect(() => {
            if (!onCancel) {
                return undefined;
            }
            const cb = () => {
                onCancel(self);
            };
            self.on('cancel', cb);
            return () => {
                self.off('cancel', cb);
            };
        }, [onCancel, self]);

        React.useLayoutEffect(() => {
            if (!onSubmit) {
                return undefined;
            }
            const cb = () => {
                onSubmit(self);
            };
            self.on('submit', cb);
            return () => {
                self.off('submit', cb);
            };
        }, [onSubmit, self]);

        return (
            <React.Fragment>
                <MarkdownEditorView
                    ref={viewRef}
                    editor={editor}
                    autofocus={autofocus}
                    className={className}
                    stickyToolbar={true}
                    toolbarsPreset={extendedToolbarsPreset}
                    qa={WysiwygEditorQa.Editor}
                />
                <MermaidRuntime />
            </React.Fragment>
        );
    },
);

MarkdownEditorDefault.displayName = 'MarkdownEditorDefault';
export type {MarkdownEditorRef, MarkdownEditorProps, MarkdownEditorMode};
export default MarkdownEditorDefault;
