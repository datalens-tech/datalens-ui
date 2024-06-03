import React from 'react';

import {ChevronDown} from '@gravity-ui/icons';
import {Icon, Link, Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {StringParams} from 'shared';
import {registry} from 'ui/registry';

import type {
    SourcesConfig,
    SourceError as TSourceError,
    SourceSuccess as TSourceSuccess,
} from '../../../../../../../../../../modules/data-provider/charts';
import Datalens from '../../SourceMeta/Datalens';

import './../Sources.scss';

const b = block('chartkit-inspector-sources');

export function getParams(searchParams: URLSearchParams) {
    const params: StringParams = {};

    for (const [key, value] of searchParams.entries()) {
        const existedValue = params[key];
        if (existedValue) {
            params[key] = Array.isArray(existedValue)
                ? existedValue.concat(value)
                : [existedValue, value];
        } else {
            params[key] = value;
        }
    }

    return params;
}

export interface SourceMetaProps {
    dataUrl: string;
    setStatus: (status: 'success' | 'failed') => void;
}

const SourceMetaBase: React.FC<{
    source: TSourceSuccess | TSourceError;
    config: SourcesConfig | null;
}> = ({source, config}) => {
    const {sourceType, uiUrl, dataUrl, datasetId} = source;

    const title = (config && config[sourceType]?.description.title) || sourceType;

    const getChartkitInspectorSourceMeta = registry.chart.functions.get(
        'getChartkitInspectorSourceMeta',
    );

    const Meta = getChartkitInspectorSourceMeta(sourceType);

    const isDatalensBi =
        (sourceType === 'bi' || sourceType === 'bi_datasets' || sourceType === 'bi_connections') &&
        datasetId;

    const defaultStatus = Meta || isDatalensBi ? 'loading' : null;
    const [status, setStatus] = React.useState<'loading' | 'success' | 'failed' | null>(
        defaultStatus,
    );

    const isLoading = status === 'loading';
    const isSuccess = status === 'success';

    if (isLoading || isSuccess) {
        return (
            <div className={b('source-meta', {centered: isLoading})}>
                {isLoading && <Loader size="s" />}
                {isSuccess && <span>{title}: </span>}
                {Meta && <Meta dataUrl={dataUrl} setStatus={setStatus} />}
                {isDatalensBi && (
                    <Datalens datasetId={datasetId} uiUrl={uiUrl} setStatus={setStatus} />
                )}
            </div>
        );
    }

    return (
        <div className={b('source-meta', {centered: isLoading})}>
            {uiUrl ? (
                <Link target="_blank" href={uiUrl}>
                    {title}
                </Link>
            ) : (
                title
            )}
        </div>
    );
};

type SourceProps = {
    source: TSourceSuccess | TSourceError;
    isCollapsible?: boolean;
    header: React.ReactNode;
    content: React.ReactNode;
    config: SourcesConfig | null;
    isError?: boolean;
};

export const Source: React.FC<SourceProps> = ({
    source,
    isCollapsible,
    config,
    header,
    content,
    isError,
}) => {
    const [expanded, setExpanded] = React.useState(false);

    const clickHandler = isCollapsible ? () => setExpanded(!expanded) : undefined;
    const isExpanded = expanded || !isCollapsible;

    return (
        <React.Fragment>
            <div
                className={b('source', {
                    collapsible: isCollapsible,
                    collapsed: !isExpanded,
                    error: isError,
                })}
                onClick={clickHandler}
            >
                <SourceMetaBase config={config} source={source} />
                {header}
                {isCollapsible && <Icon data={ChevronDown} className={b('metric')} />}
            </div>
            {isExpanded && content}
        </React.Fragment>
    );
};
