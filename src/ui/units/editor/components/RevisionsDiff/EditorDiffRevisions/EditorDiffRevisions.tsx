import React from 'react';

import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import debounce from 'lodash/debounce';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';

import {getEditorDiffDefaultOptions} from '../../../libs/monaco/options';
import MonacoDiffEditor from '../../MonacoEditor/MonacoDiffEditor';

import './EditorDiffRevisions.scss';

interface EditorDiffRevisionsProps {
    language: string;
    original: string;
    value: string;
    renderSideBySide: boolean;
}

const b = block('editor-diff-revisions');

const defaultOptions = getEditorDiffDefaultOptions();

export const EditorDiffRevisions: React.FC<EditorDiffRevisionsProps> = ({
    language,
    original,
    value,
    renderSideBySide,
}: EditorDiffRevisionsProps) => {
    const [options, changeOptions] = React.useState(defaultOptions);
    const [size, setSize] = React.useState(0);

    React.useEffect(() => {
        const onResize = debounce(() => {
            setSize(window.innerHeight + window.innerWidth);
        }, 16);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [setSize]);

    React.useEffect(() => {
        changeOptions({
            ...options,
            renderSideBySide,
        });
    }, [renderSideBySide]);

    const hasDiff = original !== value;

    return (
        <div className={b()}>
            {hasDiff ? (
                <React.Fragment>
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
                <PlaceholderIllustration
                    className={b('empty-state')}
                    title={i18n('component.editor-diff.view', 'label_without-diff')}
                    name="template"
                    direction="column"
                />
            )}
        </div>
    );
};
