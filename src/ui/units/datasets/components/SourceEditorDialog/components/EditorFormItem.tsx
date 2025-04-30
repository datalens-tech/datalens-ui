import React from 'react';

import block from 'bem-cn-lite';
import {FieldWrapper} from 'components/FieldWrapper/FieldWrapper';

import {I18n} from '../../../../../../i18n';
import Monaco from '../../../../../components/Monaco/Monaco';
import type {MonacoProps} from '../../../../../components/Monaco/Monaco';
import type {MonacoTypes} from '../../../../../libs/monaco';
import type {FormOptions} from '../../../store/types';
import type {OnSourceUpdate} from '../types';
import {getTranslate} from '../utils';

import type {RenderParamSelector} from './ParamSelector';
import {SourceHelpTooltip} from './SourceHelpTooltip';

const b = block('source-editor-dialog');
const i18n = I18n.keyset('dataset.sources-tab.modify');

type EditorFormItemProps = Omit<FormOptions, 'renderParamSelector'> & {
    onUpdate: OnSourceUpdate;
    renderParamSelector?: RenderParamSelector;
    value?: string;
    error?: string;
};

// TODO: think about highlighting such spaces in the editor
const prepareCode = (rowCode: string) => {
    // Such spaces can get into the input when copying a string from another source (for example, from telegram)
    return rowCode.replace(/\u00a0/g, ' ');
};

export const EditorFormItem: React.FC<EditorFormItemProps> = (props) => {
    const {
        onUpdate,
        renderParamSelector,
        field_doc_key,
        error,
        name = '',
        value = i18n('label_subselect-form-comment'),
    } = props;
    const editorRef = React.useRef<MonacoTypes.editor.IStandaloneCodeEditor>();
    const selection = React.useRef({
        startLineNumber: 0,
        startColumn: 0,
        endLineNumber: 0,
        endColumn: 0,
    });

    const handleUpdate = React.useCallback(
        (nextValue: string) => {
            onUpdate({[name]: prepareCode(nextValue)});
        },
        [onUpdate, name],
    );

    const handleSelectionChange = React.useCallback(
        (editor: MonacoTypes.editor.IStandaloneCodeEditor) => {
            const currentSelection = editor.getSelection();

            if (!currentSelection) {
                return;
            }

            selection.current = {
                startLineNumber: currentSelection.startLineNumber,
                startColumn: currentSelection.startColumn,
                endLineNumber: currentSelection.endLineNumber,
                endColumn: currentSelection.endColumn,
            };
        },
        [],
    );

    const handleSelectParam = React.useCallback(
        (param: {title: string}) => {
            if (!editorRef.current) {
                return;
            }

            const model = editorRef.current.getModel();

            if (!model) {
                return;
            }

            const {startLineNumber, startColumn, endLineNumber, endColumn} = selection.current;
            const startOffset = model.getOffsetAt({
                lineNumber: startLineNumber,
                column: startColumn,
            });
            const endOffset = model.getOffsetAt({lineNumber: endLineNumber, column: endColumn});

            const currentValue = model.getValue();
            const nextValue = `${currentValue.substring(0, startOffset)}{{${param.title}}}${currentValue.substring(endOffset)}`;
            onUpdate({[name]: prepareCode(nextValue)});

            const newPosition = model.getPositionAt(startOffset + param.title.length + 2); // +2 for the {} brackets
            editorRef.current.setPosition(newPosition);
            editorRef.current.focus();
        },
        [name, onUpdate],
    );

    const handelEditorMount = React.useCallback<NonNullable<MonacoProps['editorDidMount']>>(
        (editor) => {
            editorRef.current = editor;

            editor.onDidChangeCursorSelection(() => {
                handleSelectionChange(editor);
            });

            editor.focus();

            const content = editor.getModel()?.getLinesContent();
            const lineNumber = content?.length || 1;
            const column = content?.[lineNumber - 1]?.length || 1;

            // Use setTimeout to work around browser compatibility issues
            setTimeout(() => {
                editor.setPosition({lineNumber, column: column + 1});
                handleSelectionChange(editor);
            }, 100);
        },
        [handleSelectionChange],
    );

    return (
        <div className={b('param')}>
            <span className={b('label')}>
                {getTranslate(props.title)}
                <SourceHelpTooltip fieldDocKey={field_doc_key} />
            </span>
            <FieldWrapper error={error}>
                <div className={b('monaco', {error: Boolean(error)})}>
                    <Monaco
                        language="sql"
                        value={value}
                        options={{
                            minimap: {
                                enabled: false,
                            },
                            renderLineHighlight: 'none',
                        }}
                        onChange={handleUpdate}
                        editorDidMount={handelEditorMount}
                        /*  TODO: in Safari and Firefox, the setPosition method does not work correctly,
                            it is treated only through setTimeout(foo, 1000), we need to think about how to get around this bug.
                            This prevents you from initially focusing on the code editor.

                            editorDidMount={(editor) => {
                                editor.focus();
                                const content = editor.getModel()?.getLinesContent();
                                const lineNumber = content?.length || 1;
                                const column = content?.[lineNumber - 1]?.length || 1;
                                // 1 because - https://microsoft .github.io/monaco-editor/api/interfaces/monaco.iposition.html
                                editor.setPosition({lineNumber, column: column + 1});
                            }}
                        */
                    />
                </div>
            </FieldWrapper>
            {renderParamSelector
                ? renderParamSelector({
                      buttonText: i18n('button_insert-param'),
                      className: b('param-add-button-sql'),
                      onParamSelect: handleSelectParam,
                  })
                : null}
        </div>
    );
};
