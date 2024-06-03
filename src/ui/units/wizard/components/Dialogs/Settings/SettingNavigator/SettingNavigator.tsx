import React from 'react';

import block from 'bem-cn-lite';
import {i18n} from 'i18n';

import {CHART_SETTINGS} from '../../../../constants';
import SettingSwitcher from '../SettingSwitcher/SettingSwitcher';

import type {NavigatorSubSettingsProps} from './NavigatorSubSettings/NavigatorSubSettings';
import NavigatorSubSettings from './NavigatorSubSettings/NavigatorSubSettings';

type Props = NavigatorSubSettingsProps & {
    navigatorValue: string;
    onToggle: (value: string) => void;
};

const b = block('setting-navigator');

const SettingNavigator: React.FC<Props> = (props: Props) => {
    const title = i18n('wizard', 'label_navigator');

    const isNavigatorEnabled = props.navigatorValue === CHART_SETTINGS.NAVIGATOR.SHOW;

    return (
        <div className={b()}>
            <SettingSwitcher
                currentValue={props.navigatorValue}
                checkedValue={CHART_SETTINGS.NAVIGATOR.SHOW}
                uncheckedValue={CHART_SETTINGS.NAVIGATOR.HIDE}
                onChange={props.onToggle}
                title={title}
                qa="navigator-switcher"
            />
            {isNavigatorEnabled && (
                <NavigatorSubSettings
                    onUpdatePeriod={props.onUpdatePeriod}
                    periodSettings={props.periodSettings}
                    selectedLines={props.selectedLines}
                    lines={props.lines}
                    onUpdateSelectedLines={props.onUpdateSelectedLines}
                    onUpdateRadioButtons={props.onUpdateRadioButtons}
                    linesMode={props.linesMode}
                />
            )}
        </div>
    );
};

export default SettingNavigator;
