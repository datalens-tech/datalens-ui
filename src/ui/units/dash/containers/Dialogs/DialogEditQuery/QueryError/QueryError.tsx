import React from 'react';

import {I18n} from 'i18n';

import {Collapse} from '../../../../../../components/Collapse/Collapse';
import {TemplateTextPaper} from '../../../../../../components/TemplateTextPaper/TemplateTextPaper';

export type QueryErrorProps = {
    reason: string | undefined;
    query: string | undefined;
};

// @ts-ignore TODO add keysets before close https://github.com/datalens-tech/datalens-ui/issues/653
const i18n = I18n.keyset('dash.edit-query-dialog');

export const QueryError: React.FC<QueryErrorProps> = (props: QueryErrorProps) => {
    const {reason, query} = props;

    return (
        // @ts-ignore TODO add keysets before close https://github.com/datalens-tech/datalens-ui/issues/653
        <Collapse title={i18n('title_invalid-sql-query')} isExpand={true}>
            {reason ? (
                <TemplateTextPaper
                    // @ts-ignore TODO add keysets before close https://github.com/datalens-tech/datalens-ui/issues/653
                    title={i18n('title_database-response')}
                    content={reason}
                />
            ) : null}
            {query ? (
                <TemplateTextPaper
                    // @ts-ignore TODO add keysets before close https://github.com/datalens-tech/datalens-ui/issues/653
                    title={i18n('title_sent-query')}
                    content={query}
                />
            ) : null}
        </Collapse>
    );
};
