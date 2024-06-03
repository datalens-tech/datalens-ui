import React from 'react';

import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';

import {chartsDataProvider} from '../../../../../../../../../index';
import type {
    ResponseSourcesError,
    ResponseSourcesSuccess,
    SourcesConfig,
} from '../../../../../../../../../modules/data-provider/charts';

import {SourceError} from './SourceError/SourceError';
import {SourceSuccess} from './SourceSuccess/SourceSuccess';

import './Sources.scss';

const b = block('chartkit-inspector-sources');

let config: SourcesConfig | null = null;

const Sources: React.FC<{
    dataSources: ResponseSourcesSuccess | object | null;
    errorSources: ResponseSourcesError | null;
}> = ({dataSources, errorSources}) => {
    const [loading, setLoading] = React.useState(config === null);

    React.useEffect(() => {
        async function fetchConfig() {
            config = await chartsDataProvider.getConfig();
            setLoading(false);
        }
        if (loading) {
            fetchConfig();
        }
    }, [loading]);

    const innerDataSources = dataSources || {};
    const innerErrorSources = errorSources || {};

    if (!Object.keys(innerDataSources).length && !Object.keys(innerErrorSources).length) {
        return null;
    }

    const sourceValues = Object.values(innerDataSources);
    const errorValues = Object.values(innerErrorSources);

    const isSourceCollapsible = sourceValues.length + errorValues.length > 1;

    return (
        <div className={b()}>
            <div className={b('title')}>{i18n('chartkit.menu.inspector', 'label_sources')}</div>
            <div className={b('body', {centered: loading})}>
                {loading ? (
                    <Loader size="s" />
                ) : (
                    <React.Fragment>
                        {sourceValues.map((source, index) => (
                            <SourceSuccess
                                config={config}
                                source={source}
                                key={index}
                                isCollapsible={isSourceCollapsible}
                            />
                        ))}
                        {errorValues.map((source, index) => (
                            <SourceError
                                config={config}
                                source={source}
                                key={index}
                                isCollapsible={isSourceCollapsible}
                            />
                        ))}
                    </React.Fragment>
                )}
            </div>
        </div>
    );
};

export default Sources;
