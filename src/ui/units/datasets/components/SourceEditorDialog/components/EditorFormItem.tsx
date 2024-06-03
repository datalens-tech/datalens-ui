import React from 'react';

import block from 'bem-cn-lite';
import {FieldWrapper} from 'components/FieldWrapper/FieldWrapper';

import {I18n} from '../../../../../../i18n';
import Monaco from '../../../../../components/Monaco/Monaco';
import type {FormOptions} from '../../../store/types';
import type {OnSourceUpdate} from '../types';
import {getTranslate} from '../utils';

import {SourceHelpTooltip} from './SourceHelpTooltip';

const b = block('source-editor-dialog');
const i18n = I18n.keyset('dataset.sources-tab.modify');

type EditorFormItemProps = FormOptions & {
    onUpdate: OnSourceUpdate;
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
        field_doc_key,
        error,
        name = '',
        value = i18n('label_subselect-form-comment'),
    } = props;

    const _onUpdate = React.useCallback(
        (nextValue: string) => {
            onUpdate({[name]: prepareCode(nextValue)});
        },
        [onUpdate, name],
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
                        onChange={_onUpdate}
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
        </div>
    );
};
