import React, {useState} from 'react';

import {Checkbox} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';

import {getEditorDiffDefaultOptions} from '../../libs/monaco/options';
import MonacoDiffEditor from '../MonacoEditor/MonacoDiffEditor';

import './EditorDiff.scss';

const b = block('editor-diff');

const defaultOptions = getEditorDiffDefaultOptions();

interface Props {
    language: string;
    size: number;
    original?: string;
    value?: string;
}

const EditorDiff: React.FC<Props> = ({language, original, value, size}) => {
    const [options, changeOptions] = useState(defaultOptions);
    function onChangeInline() {
        changeOptions({
            ...options,
            renderSideBySide: !options.renderSideBySide,
        });
    }

    const hasDiff = original !== value;

    return (
        <div className={b()}>
            {hasDiff ? (
                <React.Fragment>
                    <div className={b('panel')}>
                        <Checkbox
                            size="m"
                            onChange={onChangeInline}
                            checked={options.renderSideBySide}
                        >
                            {i18n('component.dialog-revisions-diff.view', 'field_split-diff')}
                        </Checkbox>
                    </div>
                    <div className={b('editor-place')}>
                        <MonacoDiffEditor
                            language={language}
                            original={original}
                            value={value}
                            options={options}
                            size={size}
                        />
                    </div>
                </React.Fragment>
            ) : (
                <div className={b('without-diff')}>
                    {i18n('component.dialog-revisions-diff.view', 'label_without-diff')}
                </div>
            )}
        </div>
    );
};

export default React.memo(EditorDiff);
