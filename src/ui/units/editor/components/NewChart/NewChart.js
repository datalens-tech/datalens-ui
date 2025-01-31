import React from 'react';

import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import PropTypes from 'prop-types';
import {ActionPanel, DL, URL_QUERY} from 'ui';

import NodeTemplates from '../NodeTemplates/NodeTemplates';

import './NewChart.scss';

const b = block('new-chart');

function NewChart({onClickNodeTemplate, workbookId}) {
    const searchParams = new URLSearchParams(location.search);
    const searchCurrentPath = searchParams.get(URL_QUERY.CURRENT_PATH);
    let path = searchCurrentPath || DL.USER_FOLDER;
    path = path.endsWith('/') ? path : `${path}/`;

    return (
        <React.Fragment>
            <ActionPanel
                entry={{
                    fake: true,
                    entryId: null,
                    key: `${path}${i18n('editor.common.view', 'label_new-chart')}`,
                    fakeName: i18n('editor.common.view', 'label_new-chart'),
                    workbookId,
                }}
                history={history}
                rightItems={[null]}
            />
            <div className={b('content')}>
                <NodeTemplates onClick={onClickNodeTemplate} />
            </div>
        </React.Fragment>
    );
}

NewChart.propTypes = {
    onClickNodeTemplate: PropTypes.func.isRequired,
    workbookId: PropTypes.string,
};

export default NewChart;
