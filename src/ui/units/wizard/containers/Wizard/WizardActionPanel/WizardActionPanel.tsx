import React from 'react';

import {DropdownMenuProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {ClientChartsConfigWithDataset, EntryUpdateMode, Feature, WizardType} from 'shared';
import {ActionPanel, Utils} from 'ui';
import {selectIsChartSaved} from 'units/wizard/selectors/preview';

import {ChartSaveControls} from '../../../../../components/ActionPanel/components/ChartSaveControls/ChartSaveControl';
import type {ChartKit} from '../../../../../libs/DatalensChartkit/ChartKit/ChartKit';
import {registry} from '../../../../../registry';
import {setEditMode} from '../../../../dash/store/actions/base/actions';
import {toggleViewOnlyMode} from '../../../actions/settings';
import {WidgetData} from '../../../actions/widget';
import {selectIsFullscreen, selectViewOnlyMode} from '../../../selectors/settings';

import {useWizardActionPanel} from './useWizardActionPanel';

import './WizardActionPanel.scss';

const b = block('wizard-action-panel');

export interface WizardActionPanelProps {
    entry: WidgetData;
    configType: WizardType | undefined;
    config: {shared: ClientChartsConfigWithDataset} | undefined;
    onSaveCallback: (mode: EntryUpdateMode) => void;
    onNoRightsDialogCallback: () => void;
    onSetActualVersionCallback: () => void;
    dropdownItems: DropdownMenuProps<() => void>['items'];
    onSaveAsNewClick: () => void;
    onSaveAsDraftClick: () => void;
    onSaveAndPublishClick: () => void;
    chartKitRef: React.RefObject<ChartKit>;
}
export const WizardActionPanel: React.FC<WizardActionPanelProps> = (
    props: WizardActionPanelProps,
) => {
    const {
        dropdownItems,
        entry,
        config,
        configType,
        onNoRightsDialogCallback,
        onSaveCallback,
        onSetActualVersionCallback,
        onSaveAsNewClick,
        onSaveAndPublishClick,
        onSaveAsDraftClick,
        chartKitRef,
    } = props;

    const dispatch = useDispatch();

    const [editButtonLoading, setEditButtonLoading] = React.useState(false);

    const isChartSaved = useSelector(selectIsChartSaved);
    const isViewOnlyMode = useSelector(selectViewOnlyMode);
    const isFullscreen = useSelector(selectIsFullscreen);

    const handleEditButtonClick = React.useCallback(() => {
        const successCallback = () => {
            dispatch(toggleViewOnlyMode());
            setEditButtonLoading(false);
        };

        const failCallback = () => {
            setEditButtonLoading(false);
        };

        setEditButtonLoading(true);
        dispatch(setEditMode(successCallback, failCallback)); // logic about setEditMode moved from wizard
    }, [dispatch]);

    const isNewEntryInWorkbook = entry && entry.workbookId && entry.fake;
    const entryLocked = entry && entry.permissions && entry.permissions.edit === false;
    const saveDisabled = !config || !configType || isChartSaved;
    const saveMoreDisabled = !config || !configType;
    const isCurrentRevisionActual = entry.revId && entry.revId === entry.publishedId;
    const isNewChart = entry.fake;

    const handleSaveCallback = React.useCallback(() => {
        if (isCurrentRevisionActual) {
            onSaveCallback(EntryUpdateMode.Publish);
        } else {
            onSaveCallback(EntryUpdateMode.Save);
        }
    }, [isCurrentRevisionActual, onSaveCallback]);

    const additionalButtons = useWizardActionPanel({
        editButtonLoading,
        handleEditButtonClick,
        isViewOnlyMode,
        chartKitRef,
        isFullscreen,
    });

    const {WizardActionPanelExtension} = registry.wizard.components.getAll();

    const enablePublish = Utils.isEnabledFeature(Feature.EnablePublishEntry) && !entry.fake;

    return (
        <ActionPanel
            entry={entry}
            enablePublish={enablePublish}
            rightItems={
                <React.Fragment>
                    <WizardActionPanelExtension />
                    <ChartSaveControls
                        className={b('save-controls')}
                        onClickButtonSave={handleSaveCallback}
                        onOpenNoRightsDialog={onNoRightsDialogCallback}
                        dropdownItems={dropdownItems || []}
                        isLocked={Boolean(entryLocked)}
                        isSaveButtonDisabled={entryLocked || saveDisabled}
                        isDropdownDisabled={saveMoreDisabled}
                        isCurrentRevisionActual={isCurrentRevisionActual}
                        hideSaveDropdown={isViewOnlyMode || isNewEntryInWorkbook}
                        hideSaveButton={isViewOnlyMode}
                        additionalControls={additionalButtons}
                        onSaveAndPublishClick={onSaveAndPublishClick}
                        onSaveAsDraftClick={onSaveAsDraftClick}
                        onSaveAsNewClick={onSaveAsNewClick}
                        isNewChart={isNewChart}
                    />
                </React.Fragment>
            }
            setActualVersion={onSetActualVersionCallback}
        />
    );
};

export default WizardActionPanel;
