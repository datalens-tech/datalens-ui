import React from 'react';

import block from 'bem-cn-lite';

import Monaco, {type MonacoProps} from '../../../../../../components/Monaco/Monaco';
import {QL_LANGUAGE_ID} from '../../../../../../constants/common';
import {
    type MonacoTypes,
    registerDatalensQLLanguage,
    setDatalensQLLanguageConfiguration,
} from '../../../../../../libs/monaco';

import './QueryEditor.scss';

const b = block('query-editor');

type QueryEditorProps = {
    onQueryEditorUpdate: (query: string) => void;
    query: string | undefined;
};

export const QueryEditor: React.FC<QueryEditorProps> = (props: QueryEditorProps) => {
    const {onQueryEditorUpdate, query} = props;

    const monacoRef = React.useRef<typeof MonacoTypes | null>(null);

    const handleEditorWillMount: MonacoProps['editorWillMount'] = (monaco) => {
        monacoRef.current = monaco;

        registerDatalensQLLanguage(monaco);

        setDatalensQLLanguageConfiguration(monacoRef.current, [], []);
    };

    return (
        <div className={b()}>
            <Monaco
                editorWillMount={handleEditorWillMount}
                onChange={onQueryEditorUpdate}
                language={QL_LANGUAGE_ID}
                className={b('code-editor')}
                value={query}
                options={{
                    minimap: {
                        enabled: false,
                    },
                    renderLineHighlight: 'none',
                }}
            />
        </div>
    );
};
