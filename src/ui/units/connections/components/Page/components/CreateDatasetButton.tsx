import React from 'react';

import type {ButtonProps} from '@gravity-ui/uikit';
import {Button} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {get} from 'lodash';
import {connect} from 'react-redux';
import type {DatalensGlobalState} from 'ui';

import {workbookIdSelector} from '../../../store';

const i18n = I18n.keyset('connections.form');
const KEY_PARTS_DELIMITER = '/';

type DispatchState = ReturnType<typeof mapStateToProps>;
type CreateDatasetButtonProps = DispatchState &
    Partial<ButtonProps> & {
        entryId?: string | null;
        entryKey?: string;
    };

const getPathFromEntryKey = (key = '') => {
    return key.split(KEY_PARTS_DELIMITER).slice(0, -1).join(KEY_PARTS_DELIMITER);
};

const CreateDatasetButtonComponent = (props: CreateDatasetButtonProps) => {
    const {visible, entryKey, entryId, workbookId, size = 'm'} = props;

    if (!entryId || !visible) {
        return null;
    }

    const currentPath = getPathFromEntryKey(entryKey);
    let pathname = '/datasets/new';
    let query = `?id=${entryId}`;

    if (workbookId) {
        pathname = `/workbooks/${workbookId}${pathname}`;
    }

    if (currentPath && !workbookId) {
        query += `&currentPath=${encodeURIComponent(currentPath)}`;
    }

    return (
        <Button target="_blank" size={size} href={`${pathname}${query}`}>
            {i18n('button_create-dataset')}
        </Button>
    );
};

const isCreateDatasetButtonVisible = (state: DatalensGlobalState) => {
    const showCreateDatasetButton = get(
        state.connections.schema?.uiSchema,
        'showCreateDatasetButton',
        true,
    );
    const pageLoading = get(state.connections.ui, 'pageLoading');

    return showCreateDatasetButton && !pageLoading;
};

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        visible: isCreateDatasetButtonVisible(state),
        workbookId: workbookIdSelector(state),
    };
};

export const CreateDatasetButton = connect(mapStateToProps)(CreateDatasetButtonComponent);
