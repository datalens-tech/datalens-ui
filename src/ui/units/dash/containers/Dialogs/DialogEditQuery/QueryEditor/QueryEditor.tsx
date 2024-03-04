import React from 'react';

import block from 'bem-cn-lite';

import Monaco from '../../../../../../components/Monaco/Monaco';

import './QueryEditor.scss';

const b = block('query-editor');

type QueryEditorProps = {
    onQueryEditorUpdate: (query: string) => void;
    query: string | undefined;
};

export const QueryEditor: React.FC<QueryEditorProps> = (props: QueryEditorProps) => {
    const {onQueryEditorUpdate, query} = props;

    return (
        <div className={b()}>
            <Monaco
                onChange={onQueryEditorUpdate}
                language="sql"
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
