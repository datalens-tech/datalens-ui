import React from 'react';

import {Collapse} from '../../../../../../components/Collapse/Collapse';
import {TemplateTextPaper} from '../../../../../../components/TemplateTextPaper/TemplateTextPaper';

export type QueryErrorProps = {
    reason: string | undefined;
    query: string | undefined;
};

const i18nConnectionBasedControlFake = (str: string) => str;
export const QueryError: React.FC<QueryErrorProps> = (props: QueryErrorProps) => {
    const {reason, query} = props;

    return (
        <Collapse title={i18nConnectionBasedControlFake('title_invalid-sql-query')} isExpand={true}>
            {reason ? (
                <TemplateTextPaper
                    title={i18nConnectionBasedControlFake('title_database-response')}
                    content={reason}
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
