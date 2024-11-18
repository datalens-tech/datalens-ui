import React from 'react';

import {RadioButton, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {SelectorDialogState} from 'ui/store/typings/controlDialog';
import {EMPTY_VALUE} from 'ui/units/dash/modules/constants';

import {CONTROLS_PLACEMENT_MODE} from '../../../constants/dialogs';

import '../DialogControlsPlacement.scss';

const b = block('controls-placement-dialog');

const i18n = I18n.keyset('dash.controls-placement-dialog.edit');

type ControlPlacementRowProps = {
    onPlacementModeUpdate: (
        targetIndex: number,
        newType: SelectorDialogState['placementMode'],
    ) => void;
    onPlacementValueUpdate: (targetIndex: number, newValue: string) => void;
    title: string;
    value: string;
    mode: SelectorDialogState['placementMode'];
    index: number;
    onError: (index: number, isError: boolean) => void;
    showErrors: boolean;
};

const placementModeOptions = [
    {content: i18n('value_auto'), value: CONTROLS_PLACEMENT_MODE.AUTO},
    {content: i18n('value_percent'), value: CONTROLS_PLACEMENT_MODE.PERCENT},
    {content: i18n('value_pixels'), value: CONTROLS_PLACEMENT_MODE.PIXELS},
];

export const ControlPlacementRow = ({
    onPlacementModeUpdate,
    onPlacementValueUpdate,
    title,
    index,
    onError,
    value,
    mode,
    showErrors,
}: ControlPlacementRowProps) => {
    const [error, setError] = React.useState<boolean>(false);

    const handleValueUpdate = (newValue: string) => {
        onPlacementValueUpdate(index, newValue);
    };

    const handleModeUpdate = (newValue: string) => {
        onPlacementModeUpdate(index, newValue as SelectorDialogState['placementMode']);
    };

    React.useEffect(() => {
        if ((isNaN(Number(value)) || !value) && mode !== CONTROLS_PLACEMENT_MODE.AUTO) {
            onError(index, true);
            setError(true);
            return;
        }

        onError(index, false);
        setError(false);
    }, [value, mode, index, onError]);

    return (
        <div className={b('list-item')}>
            <div className={b('item-title')} title={title}>
                {title}
            </div>
            <RadioButton
                value={mode}
                className={b('radio-button')}
                onUpdate={handleModeUpdate}
                options={placementModeOptions}
            />
            <TextInput
                error={showErrors && error}
                value={mode === CONTROLS_PLACEMENT_MODE.AUTO ? EMPTY_VALUE : value || ''}
                onUpdate={handleValueUpdate}
                className={b('text-input')}
                disabled={mode === CONTROLS_PLACEMENT_MODE.AUTO}
            />
        </div>
    );
};
