import React from 'react';

import {Dialog, Divider, Tab, TabList, TabProvider} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {type DashTabItemGroupControl} from 'shared';
import {ControlQA, DialogGroupControlQa} from 'shared/constants/qa';
import {
    applyGroupControlDialog,
    copyControlToStorage,
} from 'ui/store/actions/controlDialog/controlDialog';
import {selectSelectorDialog} from 'ui/store/selectors/controlDialog';
import type {SetItemDataArgs} from 'ui/units/dash/store/actions/dashTyped';

import {GroupControlBody} from './GroupControlBody/GroupControlBody';
import {GroupControlFooter} from './GroupControlFooter/GroupControlFooter';
import {GroupControlSidebar} from './GroupControlSidebar/GroupControlSidebar';
import {GroupExtendedSettings} from './GroupExtendedSettings/GroupExtendedSettings';

import './DialogGroupControl.scss';

const b = block('group-control-dialog');
const i18n = I18n.keyset('dash.group-controls-dialog.edit');

const TABS = {
    SELECTORS: 'selectors',
    GROUP: 'group-settings',
} as const;

export type DialogGroupControlFeaturesProps = {
    enableAutoheightDefault?: boolean;
    showSelectorsGroupTitle?: boolean;
    theme?: string;
    enableGlobalSelectors?: boolean;
};

export type DialogGroupControlProps = {
    openedItemData: DashTabItemGroupControl['data'];
    dialogIsVisible: boolean;
    closeDialog: () => void;
    setItemData: (newItemData: SetItemDataArgs) => void;
    navigationPath: string | null;
    changeNavigationPath: (newNavigationPath: string) => void;
    selectorsGroupTitlePlaceholder?: string;
} & DialogGroupControlFeaturesProps;

export const DialogGroupControl: React.FC<DialogGroupControlProps> = ({
    dialogIsVisible,
    closeDialog,
    setItemData,
    navigationPath,
    changeNavigationPath,
    enableAutoheightDefault,
    showSelectorsGroupTitle,
    selectorsGroupTitlePlaceholder,
    enableGlobalSelectors,
}) => {
    const {id, draftId} = useSelector(selectSelectorDialog);

    const [activeTab, setActiveTab] = React.useState<string>('selectors');

    const dispatch = useDispatch();
    const handleApply = React.useCallback(() => {
        dispatch(
            applyGroupControlDialog({
                setItemData,
                closeDialog,
            }),
        );
    }, [closeDialog, dispatch, setItemData]);

    const handleClose = React.useCallback(() => {
        closeDialog();
    }, [closeDialog]);

    const handleCopyItem = React.useCallback(
        (itemIndex: number) => {
            dispatch(copyControlToStorage(itemIndex));
        },
        [dispatch],
    );

    return (
        <Dialog
            className={b()}
            size="l"
            open={dialogIsVisible}
            onClose={handleClose}
            qa={ControlQA.dialogControl}
        >
            <Dialog.Header caption={i18n('label_selector-group')} />
            <Dialog.Body className={b('body')}>
                <TabProvider value={activeTab} onUpdate={(t) => setActiveTab(t)}>
                    <TabList className={b('tab-list')}>
                        <Tab value={TABS.SELECTORS}>{i18n('label_selectors-list')}</Tab>
                        <Tab value={TABS.GROUP} qa={DialogGroupControlQa.groupSettingsButton}>
                            {i18n('label_group-settings')}
                        </Tab>
                    </TabList>
                    {activeTab === TABS.SELECTORS && (
                        <div className={b('tab-selectors')}>
                            <GroupControlSidebar handleCopyItem={handleCopyItem} />
                            <Divider orientation="vertical" className={b('divider')} />
                            <GroupControlBody
                                key={draftId || id}
                                navigationPath={navigationPath}
                                changeNavigationPath={changeNavigationPath}
                                enableGlobalSelectors={enableGlobalSelectors}
                                className={b('selector-settings')}
                            />
                        </div>
                    )}
                    {activeTab === TABS.GROUP && (
                        <GroupExtendedSettings
                            selectorsGroupTitlePlaceholder={selectorsGroupTitlePlaceholder}
                            enableAutoheightDefault={enableAutoheightDefault}
                            showSelectorsGroupTitle={showSelectorsGroupTitle}
                            enableGlobalSelectors={enableGlobalSelectors}
                        />
                    )}
                </TabProvider>
            </Dialog.Body>
            <GroupControlFooter
                handleClose={handleClose}
                handleApply={handleApply}
                className={b('footer')}
            />
        </Dialog>
    );
};
