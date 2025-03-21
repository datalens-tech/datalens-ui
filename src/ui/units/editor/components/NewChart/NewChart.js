import React from 'react';

import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import PropTypes from 'prop-types';
import {ActionPanel} from 'ui/components/ActionPanel';
import {DL, URL_QUERY} from 'ui/constants/common';

import {registry} from '../../../../registry';

import './NewChart.scss';

const b = block('new-chart');
function NewChart({workbookId}) {
    const searchParams = new URLSearchParams(location.search);
    const searchCurrentPath = searchParams.get(URL_QUERY.CURRENT_PATH);
    let path = searchCurrentPath || DL.USER_FOLDER;
    path = path.endsWith('/') ? path : `${path}/`;

    const EditorChooseTemplate = registry.editor.components.get('editor/EDITOR_CHOOSE_TPL');

    if (!EditorChooseTemplate) {
        return null;
    }

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
                <EditorChooseTemplate workbookId={workbookId} />
            </div>
        </React.Fragment>
    );
}

NewChart.propTypes = {
    workbookId: PropTypes.string,
};

export default NewChart;
