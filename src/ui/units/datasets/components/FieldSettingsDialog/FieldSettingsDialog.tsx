import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {BucketPaint} from '@gravity-ui/icons';
import {Button, Dialog, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {DatasetField, DatasetFieldColorConfig, DatasetFieldUISettings} from 'shared';
import {isNumberField} from 'shared';
import {NumberFormatSettings} from 'ui/components/NumberFormatSettings/NumberFormatSettings';
import {fetchColorPalettes} from 'ui/store/actions/colorPaletteEditor';
import {selectColorPalettesDict} from 'ui/store/selectors/colorPaletteEditor';
import {getPaletteColors} from 'ui/utils';

import {ColorsDialog} from '../ColorsDialog/ColorsDialog';
import {isFieldWithDisplaySettings} from '../DatasetTable/utils';

import './FieldSettingsDialog.scss';

const i18n = I18n.keyset('dataset.field-settings-dialog.modify');

const b = block('field-settings-dialog');

type Props = {
    open: boolean;
    field: DatasetField;
    parameters: DatasetField[];
    datasetId: string;
    workbookId?: string;
    onClose: () => void;
};

export const FieldSettingsDialog = (props: Props) => {
    const {open, field, parameters, datasetId, workbookId, onClose} = props;
    const hasDisplaySettings = field && isFieldWithDisplaySettings({field});

    const [colorDialogOpened, setColorDialogOpened] = React.useState(false);
    const [uiSettings, setUISettings] = React.useState<DatasetFieldUISettings>({});

    const dispatch = useDispatch();
    const colorPalettes = useSelector(selectColorPalettesDict);
    React.useEffect(() => {
        if (!colorPalettes.length) {
            dispatch(fetchColorPalettes());
        }
    }, [colorPalettes.length, dispatch]);

    const fieldColors = React.useMemo(() => {
        const selectedPalette = uiSettings.palette ?? '';
        const colors = getPaletteColors(selectedPalette, Object.values(colorPalettes));
        return Object.entries(uiSettings.colors ?? {}).map(([value, colorIndex]) => {
            return {value, color: colors[Number(colorIndex)]};
        });
    }, [colorPalettes, uiSettings.colors, uiSettings.palette]);

    const handleReset = () => {};

    const handleSave = () => {
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    const handleChangeFieldFormatting = () => {};

    const handleApplyColors = ({colors, palette}: DatasetFieldColorConfig) => {
        setColorDialogOpened(false);
        setUISettings({
            ...uiSettings,
            colors,
            palette,
        });
    };

    const renderFormattingSection = () => {
        if (field && isNumberField(field)) {
            return (
                <NumberFormatSettings
                    dataType={field.data_type}
                    onChange={handleChangeFieldFormatting}
                    rowClassName={b('row')}
                />
            );
        }

        return null;
    };

    return (
        <Dialog onClose={onClose} open={open} className={b()} disableHeightTransition={true}>
            <Dialog.Header caption={i18n('label_title')} />
            <Dialog.Body>
                <FormRow className={b('row')} label={i18n('label_colors')}>
                    <Button onClick={() => setColorDialogOpened(true)}>
                        <Icon data={BucketPaint} width="16" height="16" />
                        {i18n('button_colors')}
                    </Button>
                    {Boolean(fieldColors.length) && (
                        <div className={b('field-colors')}>
                            {fieldColors.map((item) => (
                                <div className={b('field-color-row')} key={item.value}>
                                    <div
                                        className={b('field-color-icon')}
                                        style={{backgroundColor: item.color}}
                                    ></div>
                                    <div>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    <ColorsDialog
                        field={field}
                        datasetId={datasetId}
                        workbookId={workbookId}
                        open={colorDialogOpened}
                        parameters={parameters}
                        onClose={() => setColorDialogOpened(false)}
                        onApply={handleApplyColors}
                    />
                </FormRow>
                {renderFormattingSection()}
            </Dialog.Body>
            <Dialog.Footer>
                <div className={b('footer')}>
                    <Button
                        size="l"
                        view="outlined"
                        className={b('btn-reset')}
                        onClick={handleReset}
                        disabled={!hasDisplaySettings}
                    >
                        {i18n('button_reset')}
                    </Button>
                    <Button size="l" view="flat" onClick={handleCancel}>
                        {i18n('button_cancel')}
                    </Button>
                    <Button size="l" view="action" onClick={handleSave}>
                        {i18n('button_save')}
                    </Button>
                </div>
            </Dialog.Footer>
        </Dialog>
    );
};
