import React from 'react';

import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {Feature} from 'shared';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {TemplateTextPaper} from '../../../../../../../../../../../../components/TemplateTextPaper/TemplateTextPaper';
import type {
    SourcesConfig,
    SourceError as TSourceError,
} from '../../../../../../../../../../modules/data-provider/charts';
import {Source, getParams} from '../Source/Source';

const b = block('chartkit-inspector-sources');

type SourceErrorProps = {
    source: TSourceError;
    config: SourcesConfig | null;
    isCollapsible?: boolean;
};

export const SourceError: React.FC<SourceErrorProps> = ({source, config, isCollapsible}) => {
    const {dataUrl, data, status, body} = source;

    const dataUrlObj = dataUrl ? new URL(dataUrl) : null;
    const dataUrlParams = dataUrlObj ? getParams(dataUrlObj.searchParams) : null;
    const showData = data && isEnabledFeature(Feature.ShowInspectorDetails);
    const showRequestQuery = dataUrlParams && Boolean(Object.keys(dataUrlParams).length);

    return (
        <Source
            config={config}
            source={source}
            isCollapsible={isCollapsible}
            isError={true}
            header={
                <React.Fragment>
                    <span className={b('metric')}>{status || <span>&mdash;</span>}</span>
                </React.Fragment>
            }
            content={
                <React.Fragment>
                    <div className={b('source-expanded')}>
                        <TemplateTextPaper
                            title="URL"
                            content={
                                dataUrlObj
                                    ? `${dataUrlObj.origin}${dataUrlObj.pathname}`
                                    : undefined
                            }
                        />
                        {showRequestQuery && (
                            <TemplateTextPaper
                                title={i18n(
                                    'chartkit.menu.inspector',
                                    'label_source-request-query',
                                )}
                                content={JSON.stringify(dataUrlParams, null, 2)}
                            />
                        )}
                        {showData && (
                            <TemplateTextPaper
                                title={i18n('chartkit.menu.inspector', 'label_source-request-data')}
                                content={JSON.stringify(data, null, 2)}
                            />
                        )}
                        {body && (
                            <TemplateTextPaper
                                title={i18n(
                                    'chartkit.menu.inspector',
                                    'label_source-response-body',
                                )}
                                content={JSON.stringify(body, null, 2)}
                            />
                        )}
                    </div>
                </React.Fragment>
            }
        />
    );
};
