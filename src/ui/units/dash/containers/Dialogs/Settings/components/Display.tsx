import React from 'react';

import {Checkbox, Label, Slider} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n, i18n as i18nOriginal} from 'i18n';
import type {ColorByTheme} from 'shared';
import {Feature} from 'shared';
import {DASH_MARGIN_STEP, MAX_DASH_MARGIN, MIN_DASH_MARGIN} from 'ui/components/DashKit/constants';
import {ColorInputsGroup} from 'ui/units/dash/containers/Dialogs/components/ColorInputsGroup/ColorInputsGroup';
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
    hideTabsValue: boolean;
    onChangeHideTabs: () => void;
    hideDashTitleValue: boolean;
    onChangeHideDashTitle: () => void;
    expandTOCValue: boolean;
    onChangeExpandTOC: () => void;
    backgroundColor: ColorByTheme | undefined;
    onChangeBackgroundColor: (color: ColorByTheme) => void;
};

export const Display = ({
    margins,
    onChangeMargins,
    hideTabsValue,
    onChangeHideTabs,
    hideDashTitleValue,
    onChangeHideDashTitle,
    expandTOCValue,
    onChangeExpandTOC,
    backgroundColor,
    onChangeBackgroundColor,
}: DisplayProps) => {
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
            {isEnabledFeature(Feature.EnableCommonChartDashSettings) && (
                <Row>
                    <Title text={i18nOriginal('dash.widget-dialog.edit', 'field_background')} />
                    <ColorInputsGroup
                        value={backgroundColor || {}}
                        onUpdate={onChangeBackgroundColor}
                        isSingleColorSelector={false}
                        direction="column"
                    />
                </Row>
            )}
        </SectionWrapper>
    );
};
