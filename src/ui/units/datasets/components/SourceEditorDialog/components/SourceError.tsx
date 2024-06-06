import React from 'react';

import block from 'bem-cn-lite';
import {Collapse} from 'ui/components/Collapse/Collapse';

import {I18n} from '../../../../../../i18n';
import type {Dataset} from '../../../../../../shared';
import type {EditedSource} from '../types';

const b = block('source-editor-dialog');
const i18n = I18n.keyset('dataset.sources-tab.modify');

interface SourceErrorProps {
    componentErrors: Dataset['component_errors'];
    source?: EditedSource;
}

export const SourceError: React.FC<SourceErrorProps> = ({componentErrors, source}) => {
    if (!source) {
        return null;
    }

    const componentError = componentErrors.items.find(
        ({type, id}) => type === 'data_source' && 'id' in source && id === source.id,
    );

    if (!componentError) {
        return null;
    }

    return (
        <div className={b('data-source-errors')}>
            {componentError.errors.map(({message, details}, i) => {
                const {db_message: dbMesssage, query} = details;

                if (!dbMesssage && !query) {
                    return null;
                }

                return (
                    <div key={`${message}-${i}`} className={b('data-source-error')}>
                        <Collapse title={message} defaultIsExpand>
                            {dbMesssage && (
                                <React.Fragment>
                                    <div>{i18n('label_data-source-error-db-response')}</div>
                                    <pre className={b('data-source-error-content')}>
                                        {dbMesssage}
                                    </pre>
                                </React.Fragment>
                            )}
                            {query && (
                                <React.Fragment>
                                    <div>{i18n('label_data-source-error-db-request')}</div>
                                    <pre className={b('data-source-error-content')}>{query}</pre>
                                </React.Fragment>
                            )}
                        </Collapse>
                    </div>
                );
            })}
        </div>
    );
};
