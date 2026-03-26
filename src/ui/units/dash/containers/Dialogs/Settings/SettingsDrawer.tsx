import React from 'react';

import {
    ChevronDown,
    Eye,
    EyeSlash,
    Moon,
    Rectangles4,
    SlidersVertical,
    Sun,
    Xmark,
} from '@gravity-ui/icons';
import {Drawer, DrawerItem} from '@gravity-ui/navigation';
import type {IconProps, ThemeType} from '@gravity-ui/uikit';
import {
    Button,
    Divider,
    Flex,
    Icon,
    NumberInput,
    SegmentedRadioGroup,
    Switch,
    Text,
    useThemeType,
} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {Feature} from 'shared';
import {DASH_MARGIN_STEP, MAX_DASH_MARGIN, MIN_DASH_MARGIN} from 'ui/components/DashKit/constants';
import {DialogRelations} from 'ui/components/DialogRelations/DialogRelations';
import {NumberInputWithSlider} from 'ui/components/NumberInputWithSlider/NumberInputWithSlider';
import {WidgetRoundingsInput} from 'ui/components/WidgetRoundingsInput/WidgetRoundingsInput';
import {useWidgetMetaContext} from 'ui/units/dash/contexts/WidgetMetaContext';
import {Mode} from 'ui/units/dash/modules/constants';
import {updateCurrentTabData} from 'ui/units/dash/store/actions/dashTyped';
import {
    selectCurrentTabAliases,
    selectCurrentTabRelationDataItems,
    selectDashMode,
    selectDashWorkbookId,
    selectDashkitRef,
    selectTabs,
    selectWidgetsCurrentTab,
} from 'ui/units/dash/store/selectors/dashTypedSelectors';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';
import type {ValuesType} from 'utility-types';

import {DialogParams} from '../DialogParams/DialogParams';
import Tabs from '../Tabs/Tabs';
import {PaletteBackground} from '../components/PaletteBackground/PaletteBackground';

import {OtherSettings} from './components/OtherSettings';
import {Row} from './components/Row';
import {Title} from './components/Title';
import {useDashSettings} from './useDashSettings';
import {getMinAutoupdateInterval} from './utils';

import './SettingsDrawer.scss';

const b = block('dl-dash-settings-drawer');
const bSettings = block('dialog-settings');
const i18n = I18n.keyset('dash.settings-dialog.edit');
const i18nActions = I18n.keyset('dash.action-panel.view');

const DrawerSections = {
    AutoRefresh: 'autoupdate',
    Display: 'display',
    OtherSettings: 'other-settings',
} as const;

const DialogSections = {
    Params: 'params',
    Connections: 'connections',
    Tabs: 'tabs',
} as const;

const isNewDashSettingsEnabled = isEnabledFeature(Feature.EnableNewDashSettings);
const isCommonChartsDashSettingsEnabled = isEnabledFeature(Feature.EnableCommonChartDashSettings);

export interface SettingsDrawerFormApiRef {
    forceFlushState: VoidFunction;
}

export interface SettingsDrawerProps {
    onClose: () => void;
    apiRef?: React.RefObject<SettingsDrawerFormApiRef>;
}

export function SettingsDrawer({onClose, apiRef}: SettingsDrawerProps) {
    const themeType = useThemeType();
    const dispatch = useDispatch();
    const metaContext = useWidgetMetaContext();
    const dashKitRef = useSelector(selectDashkitRef);

    const dashTabAliases = useSelector(selectCurrentTabAliases);
    const workbookId = useSelector(selectDashWorkbookId);
    const allWidgets = useSelector(selectCurrentTabRelationDataItems);
    const widgetsCurrentTab = useSelector(selectWidgetsCurrentTab);

    const dashMode = useSelector(selectDashMode);

    React.useEffect(() => {
        if (dashMode !== Mode.Edit) {
            onClose();
        }
    }, [dashMode, onClose]);

    const tabs = useSelector(selectTabs);
    const tabsLength = tabs?.length ?? 0;

    const [openDialogs, setOpenDialogs] = React.useState<ValuesType<typeof DialogSections> | null>(
        null,
    );

    const [theme, setTheme] = React.useState(themeType);
    const handleThemeChange = React.useCallback((value: ThemeType) => {
        setTheme(value);
    }, []);

    const {
        settings,
        autoupdate: isAutoupdateEnabled,
        autoupdateInterval,
        silentLoading,
        isGlobalParamsError,
        handleChangeAutoUpdate,
        handleAutoUpdateIntervalInputChange,
        handleChangeSilentLoading,
        handleUpdateLoadOnlyVisibleCharts,
        margins,
        handleMarginsChange,
        internalMarginsEnabled,
        handleChangeInternalMarginsEnabled,
        hideTabs,
        handleChangeHideTabs,
        hideDashTitle,
        handleChangeHideDashTitle,
        expandTOC,
        handleChangeExpandTOC,
        borderRadius,
        handleChangeBorderRadius,
        backgroundColorSettings,
        handleChangeBackgroundSettings,
        widgetsBackgroundColorSettings,
        handleChangeWidgetsBackgroundSettings,
        showDependentSelectors,
        dependentSelectorsDisabled,
        dependentSelectors,
        handleChangeDependentSelectors,
        maxConcurrentRequests,
        handleMaxConcurrentRequestsSelectChange,
        loadPriority,
        handleLoadPrioritySelectChange,
        handleButtonSetupAccessDescription,
        handleButtonSetupSupportDescription,
        loadOnlyVisibleCharts,
        otherSettingsState: otherSettinsState,
        handleChangeOtherSettings,
        localParams,
        handleEditParamTitle,
        handleEditParamValue,
        handleRemoveParam,
        handleRemoveAllParams,
        handleValidateParamTitle,
        flushAll,
        handleSaveParams,
    } = useDashSettings();

    const [openSection, setOpenSection] = React.useState<ValuesType<typeof DrawerSections> | null>(
        DrawerSections.Display,
    );

    const toggleOpenSectionCreator = React.useCallback(
        (newSection: ValuesType<typeof DrawerSections> | null) => () =>
            setOpenSection((prev) => (prev === newSection ? null : newSection)),
        [],
    );

    const handleSaveDialogParams = () => {
        handleSaveParams();
        setOpenDialogs(null);
    };

    React.useEffect(() => {
        return () => {
            flushAll();
        };
    }, [flushAll]);

    React.useImperativeHandle(
        apiRef,
        () => ({
            forceFlushState: flushAll,
        }),
        [flushAll],
    );

    if (!settings) {
        return null;
    }

    const paramsLength = Object.keys(localParams).length;

    const hideTabsTitle = hideTabs ? i18n('label_show-tabs') : i18n('label_hide-tabs');

    const content = (
        <div className={b()}>
            <SettingsSection
                open={openSection === DrawerSections.Display}
                onIconClick={toggleOpenSectionCreator(DrawerSections.Display)}
                title={i18n('label_display')}
                icon={ChevronDown}
            >
                {isNewDashSettingsEnabled && (
                    <Row direction="column">
                        <SegmentedRadioGroup
                            value={theme}
                            onUpdate={handleThemeChange}
                            options={[
                                {
                                    value: 'light',
                                    content: <Icon size={16} data={Sun} />,
                                    title: i18n('value_theme-light'),
                                },
                                {
                                    value: 'dark',
                                    content: <Icon size={16} data={Moon} />,
                                    title: i18n('value_theme-dark'),
                                },
                            ]}
                        />
                    </Row>
                )}
                {isNewDashSettingsEnabled && (
                    <Row direction="column">
                        <Title text={i18n('label_dash-background')} />
                        <div className={bSettings('sub-row')}>
                            <PaletteBackground
                                hasOpacityInput={false}
                                color={backgroundColorSettings?.[theme]}
                                oldColor={undefined}
                                onSelect={handleChangeBackgroundSettings(theme)}
                                onSelectOldColor={undefined}
                                enableCustomBgColorSelector
                                enableSeparateThemeColorSelector={false}
                                theme={theme}
                                width="max"
                            />
                        </div>
                    </Row>
                )}
                {isNewDashSettingsEnabled && (
                    <Row direction="column">
                        <Title text={i18n('label_widgets-background')} />
                        <div className={bSettings('sub-row')}>
                            <PaletteBackground
                                color={widgetsBackgroundColorSettings?.[theme]}
                                oldColor={undefined}
                                onSelect={handleChangeWidgetsBackgroundSettings(theme)}
                                onSelectOldColor={undefined}
                                enableCustomBgColorSelector
                                enableSeparateThemeColorSelector={false}
                                theme={theme}
                                width="max"
                            />
                        </div>
                    </Row>
                )}
                <Divider className={b('divider')} />
                <Flex width="100%">
                    {isNewDashSettingsEnabled && (
                        <Row direction="column">
                            <Title text={i18n('label_border-radius')} />
                            <div className={bSettings('sub-row')}>
                                <WidgetRoundingsInput
                                    value={borderRadius}
                                    onUpdate={handleChangeBorderRadius}
                                    className={b('border-radius-input')}
                                />
                            </div>
                        </Row>
                    )}
                    <Row direction="column">
                        <Title text={i18n('label_margins')} />
                        <div className={bSettings('sub-row')}>
                            <NumberInputWithSlider
                                min={MIN_DASH_MARGIN}
                                max={MAX_DASH_MARGIN}
                                step={DASH_MARGIN_STEP}
                                value={margins?.[0] ?? null}
                                onUpdate={handleMarginsChange}
                                icon={Rectangles4}
                            />
                        </div>
                    </Row>
                </Flex>
                <Row>
                    <Title text={i18n('label_title')} />
                    <Switch
                        size="l"
                        checked={!hideDashTitle}
                        onUpdate={handleChangeHideDashTitle}
                        aria-label={i18n('label_title')}
                    />
                </Row>
                <Row>
                    <Title text={i18n('label_toc')} />
                    <Switch
                        size="l"
                        qa="settings-dialog-switch-toc"
                        checked={expandTOC}
                        onUpdate={handleChangeExpandTOC}
                        aria-label={i18n('label_toc')}
                    />
                </Row>
                {isNewDashSettingsEnabled && (
                    <Row>
                        <Title text={i18n('label_internal-margins')} />
                        <Switch
                            size="l"
                            checked={internalMarginsEnabled}
                            onUpdate={handleChangeInternalMarginsEnabled}
                            aria-label={i18n('label_internal-margins')}
                        />
                    </Row>
                )}
            </SettingsSection>
            <SettingsSection
                open={false}
                onIconClick={() => setOpenDialogs(DialogSections.Tabs)}
                title={i18nActions('button_tabs')}
                icon={SlidersVertical}
                counter={tabsLength > 1 ? tabsLength : undefined}
                additionalControls={
                    <Button
                        className={b('section-header-additional-button')}
                        size="s"
                        view="flat-secondary"
                        selected={hideTabs}
                        onClick={handleChangeHideTabs}
                        title={hideTabsTitle}
                        aria-label={hideTabsTitle}
                    >
                        <Icon size={14} data={hideTabs ? EyeSlash : Eye} />
                    </Button>
                }
            />
            {openDialogs === DialogSections.Tabs && (
                <Tabs
                    closeDialog={() => setOpenDialogs(null)}
                    visible={openDialogs === DialogSections.Tabs}
                />
            )}
            <SettingsSection
                open={false}
                onIconClick={() => setOpenDialogs(DialogSections.Connections)}
                title={i18nActions('button_connections')}
                icon={SlidersVertical}
            />
            {openDialogs === DialogSections.Connections && dashKitRef && (
                <DialogRelations
                    onClose={() => setOpenDialogs(null)}
                    loadHiddenWidgetMeta={metaContext?.loadHiddenWidgetMeta}
                    onApply={(newData) => {
                        dispatch(updateCurrentTabData(newData));
                        setOpenDialogs(null);
                    }}
                    dashKitRef={dashKitRef}
                    dashTabAliases={dashTabAliases}
                    workbookId={workbookId}
                    widgetsCurrentTab={widgetsCurrentTab}
                    allWidgets={allWidgets}
                />
            )}
            <SettingsSection
                open={false}
                onIconClick={() => setOpenDialogs(DialogSections.Params)}
                title={i18n('label_global-params')}
                icon={SlidersVertical}
                counter={paramsLength}
            />
            {isCommonChartsDashSettingsEnabled && (
                <DialogParams
                    visible={openDialogs === DialogSections.Params}
                    onClose={() => setOpenDialogs(null)}
                    paramsData={localParams}
                    isParamsError={isGlobalParamsError}
                    onEditParamTitle={handleEditParamTitle}
                    onEditParamValue={handleEditParamValue}
                    onRemoveParam={handleRemoveParam}
                    onRemoveAllParams={handleRemoveAllParams}
                    validateParamTitle={handleValidateParamTitle}
                    onSave={handleSaveDialogParams}
                />
            )}
            <SettingsSection
                open={isAutoupdateEnabled}
                onIconClick={handleChangeAutoUpdate}
                title={i18n('label_autoupdate')}
                additionalControls={
                    <Switch
                        size="l"
                        checked={isAutoupdateEnabled}
                        onUpdate={handleChangeAutoUpdate}
                    />
                }
            >
                <Row>
                    <Title
                        text={`${i18n('label_autoupdate-interval')} (${i18n('field_seconds')})`}
                    />
                    <div className={bSettings('sub-row')}>
                        <NumberInput
                            min={getMinAutoupdateInterval()}
                            value={autoupdateInterval}
                            onUpdate={handleAutoUpdateIntervalInputChange}
                            aria-label={`${i18n('label_autoupdate-interval')} (${i18n('field_seconds')})`}
                        />
                    </div>
                </Row>
                <Row>
                    <Title text={i18n('label_loading')} />
                    <Switch
                        size="l"
                        checked={!silentLoading}
                        onUpdate={handleChangeSilentLoading}
                        aria-label={i18n('label_loading')}
                    />
                </Row>
            </SettingsSection>
            <SettingsSection
                open={openSection === DrawerSections.OtherSettings}
                onIconClick={toggleOpenSectionCreator(DrawerSections.OtherSettings)}
                title={i18n('label_other-settings')}
                icon={ChevronDown}
            >
                <OtherSettings
                    view="drawer"
                    showDependentSelectors={showDependentSelectors}
                    dependentSelectorsDisabled={dependentSelectorsDisabled}
                    dependentSelectorsValue={dependentSelectors}
                    onChangeDependentSelectors={handleChangeDependentSelectors}
                    maxConcurrentRequestsValue={maxConcurrentRequests}
                    onUpdateMaxConcurrentRequestsValue={handleMaxConcurrentRequestsSelectChange}
                    loadPriorityValue={loadPriority}
                    onUpdateLoadPriorityValue={handleLoadPrioritySelectChange}
                    onAccessDescriptionClick={handleButtonSetupAccessDescription}
                    onSupportDescriptionClick={handleButtonSetupSupportDescription}
                    loadOnlyVisibleCharts={loadOnlyVisibleCharts}
                    onUpdateLoadOnlyVisibleCharts={handleUpdateLoadOnlyVisibleCharts}
                    initialSettings={settings}
                    settings={otherSettinsState}
                    onChange={handleChangeOtherSettings}
                />
            </SettingsSection>
        </div>
    );

    return (
        <Drawer hideVeil>
            <DrawerItem
                id="dash-settings-drawer"
                visible={true}
                direction="right"
                className={b('drawer-item')}
            >
                <div className={b('header')}>
                    <Text variant="subheader-2">{i18n('label_settings')}</Text>
                    <Button view="flat" onClick={onClose} aria-label={i18n('button_cancel')}>
                        <Icon size={16} data={Xmark} />
                    </Button>
                </div>
                <div className={b('content')}>{content}</div>
            </DrawerItem>
        </Drawer>
    );
}

function SettingsSection({
    title,
    open,
    counter,
    onIconClick,
    children,
    icon,
    additionalControls,
}: {
    title: string;
    open: boolean;
    counter?: number;
    onIconClick: VoidFunction;
    children?: React.ReactNode;
    icon?: IconProps['data'];
    additionalControls?: React.ReactNode;
}) {
    const showCounter = Boolean(counter && counter > 0);
    // for availability
    const [contentId] = React.useState(
        () => `settings-section-${Math.random().toString(36).slice(2, 9)}`,
    );

    return (
        <div className={b('section', {open})}>
            <div className={b('section-header-wrapper')}>
                <Button
                    size="l"
                    width="max"
                    view="flat"
                    pin="brick-brick"
                    className={b('section-header')}
                    onClick={onIconClick}
                    aria-expanded={open}
                    aria-controls={children ? contentId : undefined}
                >
                    <div className={b('section-header-content')}>
                        <Text variant="subheader-1">
                            {title}
                            {showCounter ? (
                                <span
                                    className={b('section-header-counter')}
                                    aria-label={`${counter}`}
                                >
                                    {counter}
                                </span>
                            ) : null}
                        </Text>
                    </div>
                    {icon && (
                        <Button.Icon>
                            <Icon size={16} data={icon} className={b('section-header-chevron')} />
                        </Button.Icon>
                    )}
                </Button>
                {additionalControls && (
                    <div className={b('section-header-additional', {'main-icon': !icon})}>
                        {additionalControls}
                    </div>
                )}
            </div>
            {open && (
                <div id={contentId} className={b('section-content')}>
                    {children}
                </div>
            )}
        </div>
    );
}
