import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {BucketPaint} from '@gravity-ui/icons';
import {Button, Dialog, Icon, Link} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {
    CommonNumberFormattingOptions,
    DatasetField,
    DatasetFieldColorConfig,
    DatasetUpdate,
    FieldUISettings,
} from 'shared';
import {isDimensionField, isNumberField} from 'shared';
import {getFieldUISettings, isFieldWithDisplaySettings} from 'shared/utils';
import {NumberFormatSettings} from 'ui/components/NumberFormatSettings/NumberFormatSettings';
import {fetchColorPalettes} from 'ui/store/actions/colorPaletteEditor';
import {selectColorPalettesDict} from 'ui/store/selectors/colorPaletteEditor';
import {getPaletteColors} from 'ui/utils';

import {ColorsDialog} from '../ColorsDialog/ColorsDialog';

import './FieldSettingsDialog.scss';

const i18n = I18n.keyset('dataset.field-settings-dialog.modify');

const b = block('field-settings-dialog');

type Props = {
    open: boolean;
    field: DatasetField;
    parameters: DatasetField[];
    datasetId: string;
    updates?: DatasetUpdate[];
    workbookId?: string;
    onClose: () => void;
    onSave: (value: DatasetField | null) => void;
};

export const FieldSettingsDialog = (props: Props) => {
    const {open, field, parameters, datasetId, workbookId, updates, onClose, onSave} = props;
    const hasDisplaySettings = field && isFieldWithDisplaySettings({field});

    const fieldUiSettings = React.useMemo<FieldUISettings>(() => {
        if (field) {
            return getFieldUISettings({field}) ?? {};
        }

        return {};
    }, [field]);

    const [colorDialogOpened, setColorDialogOpened] = React.useState(false);
    const [uiSettings, setUISettings] = React.useState<FieldUISettings>({});

    React.useEffect(() => {
        if (open) {
            setUISettings(fieldUiSettings ?? {});
        }
    }, [open, fieldUiSettings]);

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

    const handleReset = () => {
        setUISettings({});
    };

    const handleSave = () => {
        if (field) {
            onSave({
                ...field,
                ui_settings: JSON.stringify(uiSettings),
            });
        }
    };

    const handleCancel = () => {
        onClose();
    };

    const handleChangeFieldFormatting = (value: CommonNumberFormattingOptions | undefined) => {
        setUISettings({
            ...uiSettings,
            numberFormatting: value,
        });
    };

    const handleApplyColors = ({colors, palette}: DatasetFieldColorConfig) => {
        setColorDialogOpened(false);
        setUISettings({
            ...uiSettings,
            colors,
            palette,
        });
    };

    const renderColorsSection = () => {
        const canColorizeFieldValue = isDimensionField(field);

        if (canColorizeFieldValue) {
            const selectedColors = fieldColors.slice(0, 2);
            const otherColors = fieldColors.slice(2);

            return (
                <FormRow className={b('row')} label={i18n('label_colors')}>
                    <Button onClick={() => setColorDialogOpened(true)}>
                        <Icon data={BucketPaint} width="16" height="16" />
                        {i18n('button_colors')}
                    </Button>
                    {Boolean(selectedColors.length) && (
                        <div className={b('field-colors')}>
                            {selectedColors.map((item) => (
                                <div className={b('field-color-row')} key={item.value}>
                                    <div
                                        className={b('field-color-icon')}
                                        style={{backgroundColor: item.color}}
                                    ></div>
                                    <div>{item.value}</div>
                                </div>
                            ))}
                            {Boolean(otherColors.length) && (
                                <div className={b('field-color-row')} key="other">
                                    <div>
                                        <Link
                                            view="secondary"
                                            href={''}
                                            onClick={(event) => {
                                                event.preventDefault();
                                                setColorDialogOpened(true);
                                            }}
                                        >
                                            {i18n('label_field-other-colors', {
                                                count: otherColors.length,
                                            })}
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <ColorsDialog
                        field={field}
                        fieldUiSettings={uiSettings}
                        datasetId={datasetId}
                        workbookId={workbookId}
                        open={colorDialogOpened}
                        parameters={parameters}
                        updates={updates}
                        onClose={() => setColorDialogOpened(false)}
                        onApply={handleApplyColors}
                    />
                </FormRow>
            );
        }

        return null;
    };

    const renderFormattingSection = () => {
        if (field && isNumberField(field)) {
            return (
                <NumberFormatSettings
                    dataType={field.data_type}
                    onChange={handleChangeFieldFormatting}
                    rowClassName={b('row')}
                    formatting={uiSettings?.numberFormatting ?? {}}
                />
            );
        }

        return null;
    };

    return (
        <Dialog onClose={onClose} open={open} className={b()} disableHeightTransition={true}>
            <Dialog.Header caption={i18n('label_title')} />
            <Dialog.Body>
                {renderColorsSection()}
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
