import React, {useState} from 'react';

import {Font} from '@gravity-ui/icons';
import type {SegmentedRadioGroupOptionProps} from '@gravity-ui/uikit';
import {Dialog, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import DialogManager from 'components/DialogManager/DialogManager';
import {I18n} from 'i18n';
import {useSelector} from 'react-redux';
import {CHART_SETTINGS} from 'ui/constants/visualizations';
import {DialogRadioButtons} from 'ui/units/wizard/components/Dialogs/components/DialogRadioButtons/DialogRadioButtons';
import {DialogRow} from 'ui/units/wizard/components/Dialogs/components/DialogRow/DialogRow';
import {selectExtraSettings} from 'units/wizard/selectors/widget';

import type {
    CommonSharedExtraSettings,
    LabelsPositions,
    WizardVisualizationId,
} from '../../../../../../shared';
import {VISUALIZATIONS_WITH_LABELS_POSITION} from '../../../../../../shared';

import './DialogLabelSettings.scss';

const i18n = I18n.keyset('wizard');
const b = block('dialog-label-settings');

const dialogRowCustomProps = {
    titleCustomWidth: '155px',
    rowCustomMarginBottom: '20px',
};

export type LabelSettings = {
    labelsPosition?: LabelsPositions;
    overlap?: string;
};

type Props = {
    visualizationId: WizardVisualizationId;
    onApply: (state: LabelSettings) => void;
    onClose: () => void;
};

export const DIALOG_LABEL_SETTINGS = Symbol('DIALOG_LABEL_SETTINGS');

export type OpenDialogLabelSettingsArgs = {
    id: typeof DIALOG_LABEL_SETTINGS;
    props: Props;
};

const labelPositionItems: SegmentedRadioGroupOptionProps[] = [
    {value: CHART_SETTINGS.LABELS_POSITION.INSIDE, content: i18n('label_on')},
    {value: CHART_SETTINGS.LABELS_POSITION.OUTSIDE, content: i18n('label_off')},
];

const overlapItems: SegmentedRadioGroupOptionProps[] = [
    {value: CHART_SETTINGS.OVERLAP.ON, content: i18n('label_on')},
    {value: CHART_SETTINGS.OVERLAP.OFF, content: i18n('label_off')},
];

export const DialogLabelSettings: React.FC<Props> = (props) => {
    const {onApply, onClose, visualizationId} = props;
    const shouldUsePositionSetting = VISUALIZATIONS_WITH_LABELS_POSITION.has(visualizationId);

    const {
        labelsPosition = CHART_SETTINGS.LABELS_POSITION.INSIDE,
        overlap = CHART_SETTINGS.OVERLAP.OFF,
    } = useSelector(selectExtraSettings) as CommonSharedExtraSettings;
    const [state, setState] = useState<LabelSettings>({
        labelsPosition,
        overlap,
    });

    const handleLabelPositionUpdate = (value: string) => {
        setState({...state, labelsPosition: value as LabelsPositions});
    };

    const handleOverlapUpdate = (value: string) => {
        setState({...state, overlap: value});
    };

    const handleApplySettings = () => {
        onApply(state);
    };

    return (
        <Dialog open={true} onClose={onClose}>
            <Dialog.Header
                insertBefore={
                    <div className={b('title-icon')}>
                        <Icon {...{data: Font}} size={18} />
                    </div>
                }
                caption={i18n('section_labels')}
            />
            <Dialog.Body className={b()}>
                <DialogRow
                    {...dialogRowCustomProps}
                    title={i18n('label_overlap')}
                    setting={
                        <DialogRadioButtons
                            qa="overlap-switcher"
                            items={overlapItems}
                            value={state.overlap}
                            onUpdate={handleOverlapUpdate}
                        />
                    }
                />
                {shouldUsePositionSetting && (
                    <DialogRow
                        {...dialogRowCustomProps}
                        title={i18n('label_labels-position')}
                        setting={
                            <DialogRadioButtons
                                qa="labels-position-switcher"
                                items={labelPositionItems}
                                value={state.labelsPosition}
                                onUpdate={handleLabelPositionUpdate}
                            />
                        }
                    />
                )}
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonApply={handleApplySettings}
                textButtonApply={i18n('button_apply')}
                onClickButtonCancel={onClose}
                textButtonCancel={i18n('button_cancel')}
            />
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_LABEL_SETTINGS, DialogLabelSettings);
