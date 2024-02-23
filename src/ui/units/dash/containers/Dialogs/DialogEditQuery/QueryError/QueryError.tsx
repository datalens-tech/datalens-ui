import React from 'react';

import type {GetConnectionTypedQueryErrorResponse} from 'shared/schema';

import {Collapse} from '../../../../../../components/Collapse/Collapse';
import {TemplateTextPaper} from '../../../../../../components/TemplateTextPaper/TemplateTextPaper';

export type QueryErrorProps = {
    error: GetConnectionTypedQueryErrorResponse;
    query: string | undefined;
};

const i18nConnectionBasedControlFake = (str: string) => str;
export const QueryError: React.FC<QueryErrorProps> = (props: QueryErrorProps) => {
    const {error, query} = props;
    const dbResponse = error?.details?.db_message || error?.details?.description;

    return (
        <Collapse title={i18nConnectionBasedControlFake('title_invalid-sql-query')} isExpand={true}>
            {dbResponse ? (
                <TemplateTextPaper
                    title={i18nConnectionBasedControlFake('title_database-response')}
                    content={dbResponse}
                />
            ) : null}
            {query ? (
                <TemplateTextPaper
                    title={i18nConnectionBasedControlFake('title_sent-query')}
                    content={query}
                />
            ) : null}
        </Collapse>
    );
};
