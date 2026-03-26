import React from 'react';

import type {RealTheme} from '@gravity-ui/uikit';
import ChartKit from 'libs/DatalensChartkit';
import debounce from 'lodash/debounce';
import {useDispatch, useSelector} from 'react-redux';
import {Feature} from 'shared';
import {
    DEFAULT_DASH_MARGINS,
    OLD_DEFAULT_WIDGET_BORDER_RADIUS,
} from 'ui/components/DashKit/constants';
import {registry} from 'ui/registry';
import {openDialog} from 'ui/store/actions/dialog';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {i18n} from '../../../../../../i18n';
import type {
    BackgroundSettings,
    ColorByTheme,
    ColorSettings,
    DashSettings,
    DashWidgetsSettings,
} from '../../../../../../shared';
import {DashLoadPriority} from '../../../../../../shared';
import {DIALOG_ENTRY_DESCRIPTION} from '../../../../../components/DialogEntryDescription';
import {
    partialUpdateSettings,
    updateDashAccessDescription,
    updateDashSupportDescription,
    updateExpandTocSetting,
} from '../../../store/actions/dashTyped';
import {
    selectDashAccessDescription,
    selectDashSupportDescription,
    selectDependentSelectorsSavedValue,
    selectEntryId,
    selectSettings,
} from '../../../store/selectors/dashTypedSelectors';

import {useGlobalParams} from './useGlobalParams';

const STORE_UPDATE_DEBOUNCE = 1000;

type RequiredSettings = Required<Pick<DashSettings, 'loadPriority' | 'loadOnlyVisibleCharts'>> & {
    maxConcurrentRequests: NonNullable<DashSettings['maxConcurrentRequests']>;
};
type LocalSettings = Omit<
    DashSettings,
    'widgetsSettings' | 'backgroundSettings' | keyof RequiredSettings | 'expandTOC'
> &
    RequiredSettings & {
        backgroundSettings?: {color?: ColorByTheme};
    } & {
        autoupdate: boolean;
    };
type WidgetsSettings = Omit<DashWidgetsSettings, 'backgroundSettings'> & {
    backgroundSettings?: {color?: ColorByTheme};
};
type OtherSettings = Omit<DashSettings, keyof LocalSettings | 'widgetsSettings' | 'expandTOC'>;

const isNewDashSettingsEnabled = isEnabledFeature(Feature.EnableNewDashSettings);

const parseBgColorSettings = (settings?: BackgroundSettings): ColorByTheme => {
    return typeof settings?.color === 'string'
        ? {light: settings?.color, dark: settings?.color}
        : settings?.color ?? {};
};

const normalizeMaxConcurrentRequests = (value: number | null | undefined): number | null => {
    return typeof value === 'number' && value > 0 ? value : null;
};

const mergeBgColor = <T extends {backgroundSettings?: {color?: ColorByTheme}}>(
    prev: T,
    update: Partial<T>,
): T => {
    const newBg = {
        ...prev.backgroundSettings?.color,
        ...update.backgroundSettings?.color,
    };
    return {...prev, ...update, backgroundSettings: {color: newBg}};
};

export function useDashSettings() {
    const dispatch = useDispatch();

    const isNew = !useSelector(selectEntryId);
    const settings = useSelector(selectSettings);
    const accessDesc = useSelector(selectDashAccessDescription);
    const supportDesc = useSelector(selectDashSupportDescription);
    const dependentSelectorsSavedValue = useSelector(selectDependentSelectorsSavedValue);

    const {
        expandTOC = false,
        maxConcurrentRequests,
        loadPriority,
        hideTabs,
        hideDashTitle,
        dependentSelectors,
        loadOnlyVisibleCharts,
        backgroundSettings,
        widgetsSettings,
        autoupdateInterval,
        margins,
        ...otherSettings
    } = settings;

    const [localSettings, setLocalSettings] = React.useState<LocalSettings>({
        ...otherSettings,
        autoupdateInterval: autoupdateInterval ?? null,
        autoupdate: Boolean(autoupdateInterval),
        maxConcurrentRequests: maxConcurrentRequests ?? -1,
        loadPriority: loadPriority ?? DashLoadPriority.Charts,
        hideTabs: hideTabs ?? false,
        hideDashTitle: hideDashTitle ?? false,
        dependentSelectors: dependentSelectors ?? false,
        loadOnlyVisibleCharts: loadOnlyVisibleCharts ?? true,
        margins: margins ?? DEFAULT_DASH_MARGINS,

        backgroundSettings: backgroundSettings
            ? {
                  color: parseBgColorSettings(backgroundSettings),
              }
            : undefined,
    });
    const [widgetsLocalSettings, setWidgetsLocalSettings] = React.useState<WidgetsSettings>({
        internalMarginsEnabled: widgetsSettings?.internalMarginsEnabled ?? true,
        borderRadius:
            widgetsSettings?.borderRadius ??
            (!isNew && isNewDashSettingsEnabled ? OLD_DEFAULT_WIDGET_BORDER_RADIUS : undefined),
        backgroundSettings: widgetsSettings?.backgroundSettings
            ? {
                  color: parseBgColorSettings(widgetsSettings?.backgroundSettings),
              }
            : undefined,
    });

    const {
        globalParams,
        isGlobalParamsError,
        localParams,
        handleEditParamTitle,
        handleEditParamValue,
        handleRemoveParam,
        handleRemoveAllParams,
        handleValidateParamTitle,
    } = useGlobalParams({
        initialParams: settings?.globalParams ?? {},
    });

    const [accessDescription, setAccessDesc] = React.useState(accessDesc);
    const [supportDescription, setSupportDesc] = React.useState(supportDesc);

    const [otherSettingsState, setOtherSettingsState] =
        React.useState<OtherSettings>(otherSettings);

    const [isDescriptionOpened, setIsDescriptionOpened] = React.useState(false);

    const {getMinAutoupdateInterval} = registry.dash.functions.getAll();

    const applySettingsToStore = React.useCallback(
        (settingsToApply: Partial<DashSettings>) => {
            dispatch(partialUpdateSettings(settingsToApply));

            const chartkitSettings: Partial<DashSettings> = {};
            if ('loadPriority' in settingsToApply) {
                chartkitSettings.loadPriority = settingsToApply.loadPriority;
            }
            if ('maxConcurrentRequests' in settingsToApply) {
                chartkitSettings.maxConcurrentRequests = normalizeMaxConcurrentRequests(
                    settingsToApply.maxConcurrentRequests,
                );
            }
            if (Object.keys(chartkitSettings).length > 0) {
                ChartKit?.setDataProviderSettings?.(chartkitSettings);
            }
        },
        [dispatch],
    );

    const updateStoreDebounced = React.useMemo(
        () => debounce(applySettingsToStore, STORE_UPDATE_DEBOUNCE),
        [applySettingsToStore],
    );

    const handleSaveParams = () => {
        applySettingsToStore(globalParams);
    };

    const updateWidgetsSettings = React.useCallback(
        (newSettings: Partial<WidgetsSettings>) => {
            const merged = mergeBgColor(widgetsLocalSettings, newSettings);
            setWidgetsLocalSettings(merged);
            dispatch(partialUpdateSettings({widgetsSettings: merged}));
        },
        [dispatch, widgetsLocalSettings],
    );

    const updateLocalSettings = React.useCallback(
        (newSettings: Partial<LocalSettings>) => {
            const merged = mergeBgColor(localSettings, newSettings);
            setLocalSettings(merged);

            const {
                autoupdateInterval: stateAutoupdateInterval,
                autoupdate: _autoupdate,
                maxConcurrentRequests: stateMaxConcurrentRequests,
                ...other
            } = merged;

            updateStoreDebounced({
                autoupdateInterval: stateAutoupdateInterval || null,
                maxConcurrentRequests: normalizeMaxConcurrentRequests(stateMaxConcurrentRequests),
                ...other,
            });
        },
        [localSettings, updateStoreDebounced],
    );

    const updateOtherSettings = React.useCallback(
        (newSettings: Partial<OtherSettings>) => {
            const merged = {...otherSettingsState, ...newSettings};
            setOtherSettingsState(merged);
            dispatch(partialUpdateSettings(merged));
        },
        [dispatch, otherSettingsState],
    );

    const flushAll = React.useCallback(() => {
        updateStoreDebounced.flush();
    }, [updateStoreDebounced]);

    React.useEffect(() => {
        return () => {
            flushAll();
        };
    }, [flushAll]);

    const handleMaxConcurrentRequestsSelectChange = React.useCallback(
        (text: string[]) => {
            const v = parseInt(text[0], 10);
            updateLocalSettings({maxConcurrentRequests: v});
        },
        [updateLocalSettings],
    );

    const handleLoadPrioritySelectChange = React.useCallback(
        (value: DashLoadPriority) => {
            updateLocalSettings({loadPriority: value});
        },
        [updateLocalSettings],
    );

    const handleAutoUpdateIntervalInputChange = React.useCallback(
        (value: number | null) => {
            updateLocalSettings({autoupdateInterval: value});
        },
        [updateLocalSettings],
    );

    const handleUpdateLoadOnlyVisibleCharts = React.useCallback(
        (checked: boolean) => {
            updateLocalSettings({loadOnlyVisibleCharts: checked});
        },
        [updateLocalSettings],
    );

    const handleChangeAutoUpdate = React.useCallback(() => {
        const newValue = !localSettings.autoupdate;
        updateLocalSettings({
            autoupdate: newValue,
            silentLoading: false,
            autoupdateInterval: newValue ? getMinAutoupdateInterval() : null,
        });
    }, [localSettings.autoupdate, getMinAutoupdateInterval, updateLocalSettings]);

    const handleChangeSilentLoading = React.useCallback(
        (checked: boolean) => {
            updateLocalSettings({silentLoading: !checked});
        },
        [updateLocalSettings],
    );

    const handleButtonSetupAccessDescription = React.useCallback(() => {
        setIsDescriptionOpened(true);
        dispatch(
            openDialog({
                id: DIALOG_ENTRY_DESCRIPTION,
                props: {
                    title: i18n('dash.settings-dialog.edit', 'label_access-description'),
                    description: accessDescription || '',
                    canEdit: true,
                    isEditMode: true,
                    onApply: (text: string) => {
                        setAccessDesc(text);
                        dispatch(updateDashAccessDescription(text));
                    },
                    onCloseCallback: () => setIsDescriptionOpened(false),
                },
            }),
        );
    }, [dispatch, accessDescription]);

    const handleButtonSetupSupportDescription = React.useCallback(() => {
        setIsDescriptionOpened(true);
        dispatch(
            openDialog({
                id: DIALOG_ENTRY_DESCRIPTION,
                props: {
                    title: i18n('dash.settings-dialog.edit', 'label_support-description'),
                    description: supportDescription || '',
                    canEdit: true,
                    isEditMode: true,
                    onApply: (text: string) => {
                        setSupportDesc(text);
                        dispatch(updateDashSupportDescription(text));
                    },
                    onCloseCallback: () => setIsDescriptionOpened(false),
                },
            }),
        );
    }, [dispatch, supportDescription]);

    const handleMarginsChange = React.useCallback(
        (value: number | null) => {
            if (value === null) {
                updateLocalSettings({margins: undefined});
            } else {
                updateLocalSettings({margins: [value, value]});
            }
        },
        [updateLocalSettings],
    );

    const handleChangeHideTabs = (e?: React.MouseEvent<HTMLButtonElement>) => {
        e?.stopPropagation();
        updateLocalSettings({hideTabs: !localSettings.hideTabs});
    };

    const handleChangeHideDashTitle = () => {
        updateLocalSettings({hideDashTitle: !localSettings.hideDashTitle});
    };

    const handleChangeExpandTOC = React.useCallback(
        (checked: boolean) => {
            dispatch(updateExpandTocSetting(checked));
        },
        [dispatch],
    );

    const handleChangeInternalMarginsEnabled = React.useCallback(
        (value: boolean) => {
            updateWidgetsSettings({internalMarginsEnabled: value});
        },
        [updateWidgetsSettings],
    );

    const handleChangeBorderRadius = React.useCallback(
        (value: number | undefined) => {
            updateWidgetsSettings({borderRadius: value});
        },
        [updateWidgetsSettings],
    );

    const handleChangeBackgroundSettings = React.useCallback(
        (theme: RealTheme) => (value?: ColorSettings) => {
            const newBg = typeof value === 'string' ? {[theme]: value} : value;
            updateLocalSettings({backgroundSettings: {color: newBg}});
        },
        [updateLocalSettings],
    );

    const handleChangeWidgetsBackgroundSettings = React.useCallback(
        (theme: RealTheme) => (value?: ColorSettings) => {
            const newBg = typeof value === 'string' ? {[theme]: value} : value;
            updateWidgetsSettings({backgroundSettings: {color: newBg}});
        },
        [updateWidgetsSettings],
    );

    const handleChangeDependentSelectors = React.useCallback(
        (checked: boolean) => {
            if (confirm(i18n('dash.settings-dialog.edit', 'context_dependent-selectors'))) {
                updateLocalSettings({dependentSelectors: checked});
            }
        },
        [updateLocalSettings],
    );

    const handleChangeOtherSettings = React.useCallback(
        (value: Partial<DashSettings>) => {
            updateOtherSettings(value);
        },
        [updateOtherSettings],
    );

    const dependentSelectorsDisabled = localSettings.dependentSelectors;
    const showDependentSelectors = !dependentSelectorsSavedValue;

    return {
        settings,
        isDescriptionOpened,
        getMinAutoupdateInterval,
        handleChangeAutoUpdate,
        handleAutoUpdateIntervalInputChange,
        handleChangeSilentLoading,
        handleUpdateLoadOnlyVisibleCharts,
        handleMarginsChange,
        internalMarginsEnabled: widgetsLocalSettings.internalMarginsEnabled,
        handleChangeInternalMarginsEnabled,
        handleChangeHideTabs,
        handleChangeHideDashTitle,
        expandTOC,
        handleChangeExpandTOC,
        borderRadius: widgetsLocalSettings.borderRadius,
        handleChangeBorderRadius,
        backgroundColorSettings: localSettings.backgroundSettings?.color,
        handleChangeBackgroundSettings,
        widgetsBackgroundColorSettings: widgetsLocalSettings.backgroundSettings?.color,
        handleChangeWidgetsBackgroundSettings,
        showDependentSelectors,
        dependentSelectorsDisabled,
        handleChangeDependentSelectors,

        handleMaxConcurrentRequestsSelectChange,

        handleLoadPrioritySelectChange,
        handleButtonSetupAccessDescription,
        handleButtonSetupSupportDescription,

        otherSettingsState,
        handleChangeOtherSettings,
        localParams,
        handleEditParamTitle,
        handleEditParamValue,
        handleRemoveParam,
        handleRemoveAllParams,
        handleValidateParamTitle,
        handleSaveParams,
        isGlobalParamsError,
        flushAll,
        ...localSettings,
    };
}
