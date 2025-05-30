import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import ChartKit from 'libs/DatalensChartkit';
import {batch, useDispatch, useSelector} from 'react-redux';
import {DashboardDialogSettingsQa} from 'shared/constants/qa/dash';
import {DEFAULT_DASH_MARGINS} from 'ui/components/DashKit/constants';
import {registry} from 'ui/registry';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import type {DatalensGlobalState} from '../../../../..';
import {EntryDialogName} from '../../../../..';
import {i18n} from '../../../../../../i18n';
import type {DashSettingsGlobalParams} from '../../../../../../shared';
import {DashLoadPriority, Feature} from '../../../../../../shared';
import EntryDialogues from '../../../../../components/EntryDialogues/EntryDialogues';
import {DIALOG_TYPE} from '../../../../../constants/dialogs';
import {validateParamTitle} from '../../../components/ParamsSettings/helpers';
import {toggleTableOfContent, updateAllDashSettings} from '../../../store/actions/dashTyped';
import {closeDialog} from '../../../store/actions/dialogs/actions';
import {
    selectDashAccessDescription,
    selectDashSupportDescription,
    selectIsDialogVisible,
    selectSettings,
} from '../../../store/selectors/dashTypedSelectors';

import {AutoRefresh} from './components/AutoRefresh';
import {Display} from './components/Display';
import {OtherSettings} from './components/OtherSettings';
import {Params} from './components/Params';

import './Settings.scss';

const b = block('dialog-settings');

const Settings = () => {
    const dispatch = useDispatch();

    const settings = useSelector(selectSettings);
    const visible = useSelector((state: DatalensGlobalState) =>
        selectIsDialogVisible(state, DIALOG_TYPE.SETTINGS),
    );
    const accessDesc = useSelector(selectDashAccessDescription);
    const supportDesc = useSelector(selectDashSupportDescription);

    const [maxConcurrentRequests, setMaxConcurrentRequests] = React.useState(
        settings.maxConcurrentRequests || -1, // YCSelect dictionary string key fix
    );
    const [loadPriority, setLoadPriority] = React.useState(
        settings.loadPriority || DashLoadPriority.Charts,
    );

    const [autoupdateInterval, setAutoupdateInterval] = React.useState(
        settings.autoupdateInterval || '',
    );
    const [autoupdate, setAutoupdate] = React.useState(
        Boolean(Number(settings.autoupdateInterval)),
    );
    const [silentLoading, setSilentLoading] = React.useState(settings.silentLoading || false);
    const [dependentSelectors, setDependentSelectors] = React.useState(
        settings.dependentSelectors || false,
    );
    const [loadOnlyVisibleCharts, setLoadOnlyVisibleCharts] = React.useState(
        settings.loadOnlyVisibleCharts ?? true,
    );
    const [globalParams, setGlobalParams] = React.useState(settings.globalParams || {});
    const [isGlobalParamsError, setIsGlobalParamsError] = React.useState(false);
    const [hideTabs, setHideTabs] = React.useState(settings.hideTabs);
    const [hideDashTitle, setHideTitle] = React.useState(Boolean(settings.hideDashTitle));
    const [expandTOC, setExpandTOC] = React.useState(settings.expandTOC);
    const [accessDescription, setAccessDesc] = React.useState(accessDesc);
    const [supportDescription, setSupportDesc] = React.useState(supportDesc);
    const [margins, setMargins] = React.useState(settings.margins || DEFAULT_DASH_MARGINS);

    const entryDialoguesRef = React.useRef<EntryDialogues>(null);

    const {getMinAutoupdateInterval} = registry.dash.functions.getAll();

    const isValidAutoupdateInterval = () => {
        let result = true;
        if (autoupdate && Number(autoupdateInterval) < getMinAutoupdateInterval()) {
            setAutoupdateInterval(getMinAutoupdateInterval());
            result = false;
        }
        if (!autoupdate && silentLoading) {
            setSilentLoading(false);
            result = false;
        }
        return result;
    };

    const handleMaxConcurrentRequestsSelectChange = (text: string[]) => {
        setMaxConcurrentRequests(parseInt(text[0], 10));
    };

    const handleLoadPrioritySelectChange = (value: DashLoadPriority) => {
        setLoadPriority(value);
    };

    const handleAutoUpdateIntervalInputChange = (text: string) => {
        const value = text === '' ? text : parseInt(text, 10);

        setAutoupdateInterval(value);
    };

    const handleUpdateLoadOnlyVisibleCharts = () =>
        setLoadOnlyVisibleCharts(!loadOnlyVisibleCharts);

    const handleButtonApplyClick = () => {
        if (!isValidAutoupdateInterval()) {
            return;
        }

        if (
            settings.dependentSelectors ||
            !dependentSelectors ||
            confirm(i18n('dash.settings-dialog.edit', 'context_dependent-selectors'))
        ) {
            const newSettings = {
                ...settings,
                autoupdateInterval:
                    (typeof autoupdateInterval === 'string'
                        ? parseInt(autoupdateInterval)
                        : autoupdateInterval) || null,
                maxConcurrentRequests: maxConcurrentRequests > 0 ? maxConcurrentRequests : null,
                loadOnlyVisibleCharts,
                silentLoading,
                dependentSelectors,
                globalParams,
                hideTabs,
                hideDashTitle,
                expandTOC,
                loadPriority,
            };

            if (
                margins &&
                margins[0] !== DEFAULT_DASH_MARGINS[0] &&
                margins[1] !== DEFAULT_DASH_MARGINS[1]
            ) {
                newSettings.margins = margins;
            } else {
                // Cleaning default values
                delete newSettings.margins;
            }

            batch(() => {
                dispatch(toggleTableOfContent(Boolean(expandTOC)));
                dispatch(
                    updateAllDashSettings({
                        settings: newSettings,
                        accessDescription,
                        supportDescription,
                    }),
                );
            });

            ChartKit?.setDataProviderSettings?.({
                loadPriority,
                maxConcurrentRequests: maxConcurrentRequests > 0 ? maxConcurrentRequests : null,
            });

            dispatch(closeDialog());
        }
    };

    const handleButtonSetupAccessDescription = React.useCallback(() => {
        entryDialoguesRef?.current?.open?.({
            dialog: EntryDialogName.DashMeta,
            dialogProps: {
                title: i18n('dash.settings-dialog.edit', 'label_access-description'),
                text: accessDescription || '',
                canEdit: true,
                isEditMode: true,
                onApply: (text: string) => setAccessDesc(text),
            },
        });
    }, [entryDialoguesRef, accessDescription]);

    const handleButtonSetupSupportDescription = React.useCallback(() => {
        entryDialoguesRef?.current?.open?.({
            dialog: EntryDialogName.DashMeta,
            dialogProps: {
                title: i18n('dash.settings-dialog.edit', 'label_support-description'),
                text: supportDescription || '',
                canEdit: true,
                isEditMode: true,
                onApply: (text: string) => setSupportDesc(text),
            },
        });
    }, [entryDialoguesRef, supportDescription]);

    const handleChangeGlobalParams = React.useCallback((params: DashSettingsGlobalParams) => {
        setIsGlobalParamsError(
            Object.keys(params).some((param) => Boolean(validateParamTitle(param))),
        );
        setGlobalParams(params);
    }, []);

    const handleMarginsChange = React.useCallback((margins: number | [number, number]) => {
        if (Array.isArray(margins)) {
            setMargins(margins);
        } else {
            setMargins([margins, margins]);
        }
    }, []);

    const showDependentSelectors = !settings.dependentSelectors;

    return settings ? (
        <Dialog
            open={visible}
            onClose={() => dispatch(closeDialog())}
            disableEscapeKeyDown={true}
            qa={DashboardDialogSettingsQa.DialogRoot}
        >
            <Dialog.Header caption={i18n('dash.settings-dialog.edit', 'label_settings')} />
            <Dialog.Body className={b()}>
                {isEnabledFeature(Feature.DashAutorefresh) && (
                    <AutoRefresh
                        autoUpdateValue={autoupdate}
                        onChangeAutoUpdate={() => {
                            const newValue = !autoupdate;
                            setAutoupdate(newValue);
                            setSilentLoading(false);
                            setAutoupdateInterval(newValue ? getMinAutoupdateInterval() : '');
                        }}
                        intervalDisabled={!autoupdate}
                        intervalValue={String(autoupdateInterval)}
                        onUpdateInterval={handleAutoUpdateIntervalInputChange}
                        onBlurInterval={() => isValidAutoupdateInterval()}
                        silentLoadingValue={silentLoading}
                        silentLoadingDisabled={!autoupdate}
                        onChangeSilentLoading={() => setSilentLoading(!silentLoading)}
                    />
                )}
                <Display
                    margins={margins}
                    onChangeMargins={handleMarginsChange}
                    hideTabsValue={hideTabs}
                    onChangeHideTabs={() => setHideTabs(!hideTabs)}
                    hideDashTitleValue={hideDashTitle}
                    onChangeHideDashTitle={() => setHideTitle(!hideDashTitle)}
                    expandTOCValue={expandTOC}
                    onChangeExpandTOC={() => setExpandTOC(!expandTOC)}
                />
                <OtherSettings
                    showDependentSelectors={showDependentSelectors}
                    dependentSelectorsValue={dependentSelectors}
                    onChangeDependentSelectors={() => setDependentSelectors(!dependentSelectors)}
                    maxConcurrentRequestsValue={maxConcurrentRequests}
                    onUpdateMaxConcurrentRequestsValue={handleMaxConcurrentRequestsSelectChange}
                    loadPriorityValue={loadPriority}
                    onUpdateLoadPriorityValue={handleLoadPrioritySelectChange}
                    onAccessDescriptionClick={handleButtonSetupAccessDescription}
                    onSupportDescriptionClick={handleButtonSetupSupportDescription}
                    loadOnlyVisibleCharts={loadOnlyVisibleCharts}
                    onUpdateLoadOnlyVisibleCharts={handleUpdateLoadOnlyVisibleCharts}
                />
                <Params paramsValue={globalParams} onChangeParamsValue={handleChangeGlobalParams} />
                <EntryDialogues ref={entryDialoguesRef} />
            </Dialog.Body>
            <Dialog.Footer
                textButtonApply={i18n('dash.settings-dialog.edit', 'button_save')}
                onClickButtonApply={handleButtonApplyClick}
                textButtonCancel={i18n('dash.settings-dialog.edit', 'button_cancel')}
                onClickButtonCancel={() => dispatch(closeDialog())}
                propsButtonApply={{
                    disabled: isGlobalParamsError,
                    qa: DashboardDialogSettingsQa.ApplyButton,
                }}
                propsButtonCancel={{qa: DashboardDialogSettingsQa.CancelButton}}
            />
        </Dialog>
    ) : null;
};

export default Settings;
