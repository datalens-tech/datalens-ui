import React from 'react';

import type {ButtonProps} from '@gravity-ui/uikit';
import {Button} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {get} from 'lodash';
import {connect} from 'react-redux';
import type {WorkbookId} from 'shared';
import {ConnectionsActionPanelControls, RawSQLLevel} from 'shared';
import type {DatalensGlobalState} from 'ui';

import {FieldKey} from '../../../constants';

const i18n = I18n.keyset('connections.form');

type DispatchState = ReturnType<typeof mapStateToProps>;
type CreateQlChartButtonProps = DispatchState &
    Partial<ButtonProps> & {
        entryId?: string | null;
        workbookId?: WorkbookId;
    };

const CreateQlChartButtonComponent = (props: CreateQlChartButtonProps) => {
    const {visible, entryId, workbookId, size = 'm'} = props;

    if (!visible || !entryId) {
        return null;
    }

    const query = `?connectionId=${entryId}`;
    const pathname = workbookId ? `/workbooks/${workbookId}/ql` : '/ql';

    return (
        <Button
            qa={ConnectionsActionPanelControls.CREATE_QL_CHART_BUTTON}
            target="_blank"
            size={size}
            href={`${pathname}${query}`}
        >
            {i18n('button_create-sql-chart')}
        </Button>
    );
};

const isQlButtonVisible = (state: DatalensGlobalState) => {
    const showCreateQlChartButton = get(
        state.connections.schema?.uiSchema,
        'showCreateQlChartButton',
        false,
    );
    const pageLoading = get(state.connections.ui, 'pageLoading');
    const initialForm = state.connections.initialForm;
    const value = (initialForm[FieldKey.RawSqlLevel] as string) || undefined;

    return !pageLoading && (value === RawSQLLevel.Dashsql || showCreateQlChartButton);
};

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        visible: isQlButtonVisible(state),
    };
};

export const CreateQlChartButton = connect(mapStateToProps)(CreateQlChartButtonComponent);
