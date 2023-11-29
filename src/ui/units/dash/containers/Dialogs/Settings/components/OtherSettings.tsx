import React from 'react';

import {Button, Checkbox, SelectProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {DashLoadPriority, Feature} from '../../../../../../../shared';
import {SectionWrapper} from '../../../../../../components/SectionWrapper/SectionWrapper';
import Utils from '../../../../../../utils';

import {LoadPriority} from './LoadPriority';
import {MaxConnection} from './MaxConnection';
import {Row} from './Row';
import {Title} from './Title';

import '../Settings.scss';

const b = block('dialog-settings');
const i18n = I18n.keyset('dash.settings-dialog.edit');

type OtherSettingsProps = {
    showDependentSelectors: boolean;
    dependentSelectorsValue: boolean;
    onChangeDependentSelectors: () => void;
    maxConcurrentRequestsValue: number;
    onUpdateMaxConcurrentRequestsValue: SelectProps['onUpdate'];
    loadPriorityValue: DashLoadPriority;
    onUpdateLoadPriorityValue: (value: DashLoadPriority) => void;
    onAccessDescriptionClick: () => void;
    onSupportDescriptionClick: () => void;
    loadOnlyVisibleCharts: boolean;
    onUpdateLoadOnlyVisibleCharts: () => void;
};

export const OtherSettings = ({
    showDependentSelectors,
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
}: OtherSettingsProps) => {
    const showAccessDescriptionSetting = Utils.isEnabledFeature(Feature.DashBoardAccessDescription);
    const showSupportDescriptionSetting = Utils.isEnabledFeature(
        Feature.DashBoardSupportDescription,
    );
    return (
        <SectionWrapper title={i18n('label_other-settings')} titleMods={b('section-title')}>
            <Row>
                <Title text={i18n('label_load-only-visibile-charts')} />
                <Checkbox
                    size="l"
                    checked={loadOnlyVisibleCharts}
                    onChange={onUpdateLoadOnlyVisibleCharts}
                    className={b('box')}
                />
            </Row>
            <MaxConnection
                maxValue={maxConcurrentRequestsValue}
                onUpdate={onUpdateMaxConcurrentRequestsValue}
            />
            <LoadPriority value={loadPriorityValue} onUpdate={onUpdateLoadPriorityValue} />
            {showDependentSelectors && (
                <Row>
                    <Title text={i18n('label_dependent-selectors')} />
                    <Checkbox
                        size="l"
                        checked={dependentSelectorsValue}
                        onChange={onChangeDependentSelectors}
                        className={b('box')}
                    />
                </Row>
            )}
            {showSupportDescriptionSetting && (
                <Row>
                    <Title text={i18n('label_support-description')} />
                    <Button className={b('box')} onClick={onSupportDescriptionClick}>
                        {i18n('button_setup')}
                    </Button>
                </Row>
            )}
            {showAccessDescriptionSetting && (
                <Row>
                    <Title text={i18n('label_access-description')} />
                    <Button className={b('box')} onClick={onAccessDescriptionClick}>
                        {i18n('button_setup')}
                    </Button>
                </Row>
            )}
        </SectionWrapper>
    );
};
