import React from 'react';

import {Button, Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import PropTypes from 'prop-types';

import {Status} from '../../constants/common';
import {useFetch} from '../../hooks/useFetch';

import './Fetch.scss';

const b = block('fetch-renderer');

function FetchError({refetch}) {
    return (
        <div className={b('error')}>
            <span className={b('error-text')}>
                {i18n('editor.fetch.view', 'label_loading-error')}
            </span>
            <br />
            <Button view="action" size="m" onClick={refetch}>
                {i18n('editor.fetch.view', 'button_repeat')}
            </Button>
        </div>
    );
}

FetchError.propTypes = {
    refetch: PropTypes.func,
};

function FetchLoader() {
    return (
        <div className={b('loader')}>
            <Loader size="m" />
        </div>
    );
}

function Fetch({fetch, formatter, children, renderLoader, renderError, className}) {
    const fetchData = useFetch(fetch, formatter);
    const {status} = fetchData;

    function renderContent() {
        if (status === Status.Success && children) {
            return children(fetchData);
        }
        if (status === Status.Loading) {
            return renderLoader ? renderLoader(fetchData) : <FetchLoader />;
        }
        if (status === Status.Failed) {
            return renderError ? renderError(fetchData) : <FetchError {...fetchData} />;
        }
        return null;
    }

    return <div className={b({status}, className)}>{renderContent()}</div>;
}

Fetch.Error = FetchError;
Fetch.Loader = FetchLoader;

Fetch.propTypes = {
    fetch: PropTypes.func.isRequired,
    formatter: PropTypes.func,
    className: PropTypes.string,
    renderError: PropTypes.func,
    renderLoader: PropTypes.func,
    children: PropTypes.func,
};

export default Fetch;
