import React from 'react';

import {useThemeValue} from '@gravity-ui/uikit';

import type {MonacoDiffEditorProps as MonacoDiffEditorBaseProps} from '../../../../components/Monaco/LazyMonaco';
import {LazyMonacoDiffEditor} from '../../../../components/Monaco/LazyMonaco';
import type {MonacoTypes} from '../../../../libs/monaco';
import {mapUIKitThemeToMonacoTheme} from '../../../../libs/monaco';

import './MonacoEditor.scss';

export interface MonacoDiffEditorProps extends MonacoDiffEditorBaseProps {
    language: string;
    size: number;
    original?: string;
    value?: string;
    options?: MonacoTypes.editor.IDiffEditorConstructionOptions;
}

const MonacoDiffEditor: React.FC<MonacoDiffEditorProps> = (props) => {
    const {size, ...restProps} = props;
    const [editorInstance, setEditorInstance] =
        React.useState<MonacoTypes.editor.IStandaloneDiffEditor | null>(null);
    const themeValue = useThemeValue();
    const theme = mapUIKitThemeToMonacoTheme(themeValue);

    React.useEffect(() => {
        if (editorInstance && typeof editorInstance.layout === 'function') {
            editorInstance.layout();
        }
    }, [size, editorInstance]);

    return (
        <div className="react-monaco-editor-container">
            <LazyMonacoDiffEditor
                {...restProps}
                theme={theme}
                editorDidMount={(editor) => setEditorInstance(editor)}
            />
        </div>
    );
};

export default MonacoDiffEditor;
