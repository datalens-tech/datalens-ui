import React from 'react';

import {Checkbox, Label, Slider, Switch} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {Feature} from 'shared';
import {DASH_MARGIN_STEP, MAX_DASH_MARGIN, MIN_DASH_MARGIN} from 'ui/components/DashKit/constants';
import {WidgetRoundingsInput} from 'ui/components/WidgetRoundingsInput/WidgetRoundingsInput';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {SectionWrapper} from '../../../../../../components/SectionWrapper/SectionWrapper';

import {Row} from './Row';
import {Title} from './Title';

import '../Settings.scss';

const b = block('dialog-settings');
const i18n = I18n.keyset('dash.settings-dialog.edit');

type DisplayProps = {
    margins: [number, number];
    onChangeMargins: (newMargins: number | [number, number]) => void;
    internalMarginsEnabled: boolean;
    onChangeInternalMarginsEnabled: (newInternalMarginsEnabled: boolean) => void;
    borderRadius: number | undefined;
    onChangeBorderRadius: (newBorderRadius: number | undefined) => void;
    hideTabsValue: boolean;
    onChangeHideTabs: () => void;
    hideDashTitleValue: boolean;
    onChangeHideDashTitle: () => void;
    expandTOCValue: boolean;
    onChangeExpandTOC: () => void;
};

export const Display = ({
    margins,
    onChangeMargins,
    internalMarginsEnabled,
    onChangeInternalMarginsEnabled,
    borderRadius,
    onChangeBorderRadius,
    hideTabsValue,
    onChangeHideTabs,
    hideDashTitleValue,
    onChangeHideDashTitle,
    expandTOCValue,
    onChangeExpandTOC,
}: DisplayProps) => {
    const isNewDashSettingsEnabled = isEnabledFeature(Feature.EnableNewDashSettings);
    return (
        <SectionWrapper
            title={i18n('label_display')}
            titleMods={b('section-title')}
            subTitle={i18n('label_display-info')}
        >
            <Row>
                <Title text={i18n('label_title')} />
                <Checkbox
                    size="l"
                    checked={!hideDashTitleValue}
                    onChange={onChangeHideDashTitle}
                    className={b('box')}
                />
            </Row>
            <Row>
                <Title text={i18n('label_tabs')} />
                <Checkbox
                    size="l"
                    checked={!hideTabsValue}
                    onChange={onChangeHideTabs}
                    className={b('box')}
                />
            </Row>
            <Row>
                <Title text={i18n('label_toc')} />
                <Checkbox
                    size="l"
                    qa="settings-dialog-switch-toc"
                    checked={expandTOCValue}
                    onChange={onChangeExpandTOC}
                    className={b('box')}
                />
            </Row>
            {isNewDashSettingsEnabled && (
                <Row>
                    <Title text={i18n('label_border-radius')} />
                    <WidgetRoundingsInput
                        value={borderRadius}
                        onUpdate={onChangeBorderRadius}
                        className={b('border-radius-input')}
                    />
                </Row>
            )}
            {isEnabledFeature(Feature.EnableCustomDashMargins) && (
                <Row>
                    <div>
                        <Title text={i18n('label_margins')}>
                            <Label theme={'warning'}>{i18n('label_experimental')}</Label>
                        </Title>
                    </div>
                    <Slider
                        min={MIN_DASH_MARGIN}
                        max={MAX_DASH_MARGIN}
                        step={DASH_MARGIN_STEP}
                        tooltipDisplay={'on'}
                        value={margins[0]}
                        onUpdate={onChangeMargins}
                    />
                </Row>
            )}
            {isNewDashSettingsEnabled && (
                <Row>
                    <Title text={i18n('label_internal-margins')} />
                    <Switch
                        checked={internalMarginsEnabled}
                        onUpdate={onChangeInternalMarginsEnabled}
                    />
                </Row>
            )}
        </SectionWrapper>
    );
};
