import React from 'react';

import block from 'bem-cn-lite';
import {DL} from 'ui/constants/common';

import {BatchPanel} from '../../components/BatchPanel/BatchPanel';
import type {BatchAction} from '../../types';

import {BatchDialog} from './BatchDialog/BatchDialog';
import {List} from './List/List';
import type {TableViewProps} from './types';
import {useBatchSelect} from './useBatchSelect';

import './TableView.scss';

const b = block('dl-core-navigation-table-view');

export const TableView = (props: TableViewProps) => {
    const {isMobileNavigation, onItemSelect, ...listProps} = props;

    const [batchAction, setBatchAction] = React.useState<BatchAction | null>(null);

    const {
        selectedIds,
        isBatchEnabled,
        onEntrySelect,
        isAllCheckBoxChecked,
        onAllCheckBoxSelect,
        resetSelected,
    } = useBatchSelect({
        isMobileNavigation,
        onItemSelect,
        mode: props.mode,
        entries: props.entries,
    });

    const countSelectedIds = selectedIds.size;
    const showBatchPanel = isBatchEnabled && countSelectedIds > 0;

    return (
        <div className={b({mobile: DL.IS_MOBILE})}>
            <List
                {...listProps}
                selectedIds={selectedIds}
                isBatchEnabled={isBatchEnabled}
                onEntrySelect={onEntrySelect}
                showBatchPanel={showBatchPanel}
                isAllCheckBoxChecked={isAllCheckBoxChecked}
                onAllCheckBoxSelect={onAllCheckBoxSelect}
            />
            {showBatchPanel && (
                <BatchPanel
                    count={countSelectedIds}
                    onAction={setBatchAction}
                    className={b('batch-panel')}
                    onClose={resetSelected}
                />
            )}
            {batchAction && (
                <BatchDialog
                    action={batchAction}
                    onClose={() => setBatchAction(null)}
                    selectedIds={selectedIds}
                    entries={props.entries}
                    refreshNavigation={props.refreshNavigation}
                    onChangeLocation={props.onChangeLocation}
                />
            )}
        </div>
    );
};
