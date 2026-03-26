import React from 'react';

import {Pencil} from '@gravity-ui/icons';
import type {SelectProps} from '@gravity-ui/uikit';
import {Button, Checkbox, HelpMark, Icon, Switch} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {registry} from 'ui/registry';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {type DashLoadPriority, type DashSettings, Feature} from '../../../../../../../shared';

import {LoadPriority} from './LoadPriority';
import {MaxConnection} from './MaxConnection';
import {Row} from './Row';
import {Title} from './Title';

import '../Settings.scss';

const b = block('dialog-settings');
const i18n = I18n.keyset('dash.settings-dialog.edit');

type OtherSettingsProps = {
    view?: 'dialog' | 'drawer';
    showDependentSelectors: boolean;
    dependentSelectorsDisabled: boolean;
    dependentSelectorsValue: boolean;
    onChangeDependentSelectors: (checked: boolean) => void;
    maxConcurrentRequestsValue: number;
    onUpdateMaxConcurrentRequestsValue: SelectProps['onUpdate'];
    loadPriorityValue: DashLoadPriority;
    onUpdateLoadPriorityValue: (value: DashLoadPriority) => void;
    onAccessDescriptionClick: () => void;
    onSupportDescriptionClick: () => void;
    loadOnlyVisibleCharts: boolean;
    onUpdateLoadOnlyVisibleCharts: (checked: boolean) => void;
    initialSettings: DashSettings;
    settings: Partial<DashSettings>;
    onChange: (settings: Partial<DashSettings>) => void;
};

export const OtherSettings = ({
    view,
    showDependentSelectors,
    dependentSelectorsDisabled,
    dependentSelectorsValue,
    onChangeDependentSelectors,
    maxConcurrentRequestsValue,
    onUpdateMaxConcurrentRequestsValue,
    loadPriorityValue,
    onUpdateLoadPriorityValue,
    onAccessDescriptionClick,
    onSupportDescriptionClick,
    loadOnlyVisibleCharts,
    onUpdateLoadOnlyVisibleCharts,
    initialSettings,
    settings,
    onChange,
}: OtherSettingsProps) => {
    const showSupportDescriptionSetting = isEnabledFeature(Feature.DashBoardSupportDescription);
    const {DialogDashOtherSettingsPrepend} = registry.dash.components.getAll();

    return (
        <React.Fragment>
            <DialogDashOtherSettingsPrepend
                initialSettings={initialSettings}
                settings={settings}
                onChange={onChange}
                view={view}
            />
            <Row>
                <Title text={i18n('label_load-only-visible-charts')}>
                    <HelpMark>{i18n('hint_load-only-visible-charts')}</HelpMark>
                </Title>
                {view === 'drawer' ? (
                    <Switch
                        size="l"
                        checked={loadOnlyVisibleCharts}
                        onUpdate={onUpdateLoadOnlyVisibleCharts}
                        aria-label={i18n('label_load-only-visible-charts')}
                    />
                ) : (
                    <Checkbox
                        size="l"
                        checked={loadOnlyVisibleCharts}
                        onUpdate={onUpdateLoadOnlyVisibleCharts}
                        className={b('box')}
                    />
                )}
            </Row>
            <MaxConnection
                maxValue={maxConcurrentRequestsValue}
                onUpdate={onUpdateMaxConcurrentRequestsValue}
                view={view}
            />
            <LoadPriority
                value={loadPriorityValue}
                onUpdate={onUpdateLoadPriorityValue}
                view={view}
            />
            {showDependentSelectors && (
                <Row>
                    <Title text={i18n('label_dependent-selectors')} />
                    {view === 'drawer' ? (
                        <Switch
                            size="l"
                            checked={dependentSelectorsValue}
                            onUpdate={onChangeDependentSelectors}
                            disabled={dependentSelectorsDisabled}
                            aria-label={i18n('label_dependent-selectors')}
                        />
                    ) : (
                        <Checkbox
                            size="l"
                            checked={dependentSelectorsValue}
                            onUpdate={onChangeDependentSelectors}
                            disabled={dependentSelectorsDisabled}
                            className={b('box')}
                        />
                    )}
                </Row>
            )}
            {showSupportDescriptionSetting && (
                <Row>
                    <Title text={i18n('label_support-description')} />
                    <SetupButton onClick={onSupportDescriptionClick} view={view} />
                </Row>
            )}
            <Row>
                <Title text={i18n('label_access-description')} />
                <SetupButton onClick={onAccessDescriptionClick} view={view} />
            </Row>
        </React.Fragment>
    );
};

function SetupButton({onClick, view}: {onClick: () => void; view?: 'dialog' | 'drawer'}) {
    return (
        <Button
            className={b('box')}
            onClick={onClick}
            view={view === 'drawer' ? 'flat-secondary' : 'normal'}
            aria-label={view === 'drawer' ? i18n('button_setup') : undefined}
        >
            {view === 'drawer' ? (
                <Button.Icon>
                    <Icon data={Pencil} size="16" />
                </Button.Icon>
            ) : (
                i18n('button_setup')
            )}
        </Button>
    );
}
