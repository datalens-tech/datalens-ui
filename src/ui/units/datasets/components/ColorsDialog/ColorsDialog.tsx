import React from 'react';

import type {PaletteOption} from '@gravity-ui/uikit';
import {Button, Dialog, Palette} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useSelector} from 'react-redux';
import type {DatasetField, DatasetFieldColorConfig, DatasetUpdate, FieldUISettings} from 'shared';
import {
    TIMEOUT_90_SEC,
    getFieldDistinctValues,
    getFieldsApiV2RequestSection,
    getParametersApiV2RequestSection,
} from 'shared';
import {ColorPaletteSelect} from 'ui/components/ColorPaletteSelect/ColorPaletteSelect';
import {PaletteItem} from 'ui/components/PaletteItem/PaletteItem';
import {ValuesList} from 'ui/components/ValuesList/ValuesList';
import {getTenantDefaultColorPaletteId} from 'ui/constants';
import {getSdk} from 'ui/libs/schematic-sdk';
import {selectColorPalettesDict} from 'ui/store/selectors/colorPaletteEditor';
import {getPaletteColors} from 'ui/utils';

import './ColorsDialog.scss';

export const DEFAULT_COLOR = 'auto';

// toDo: move to component keyset
const i18n = I18n.keyset('wizard');

const VALUES_LOAD_LIMIT = 1000;

const b = block('colors-dialog');

type Props = {
    open: boolean;
    field: DatasetField;
    fieldUiSettings: FieldUISettings;
    datasetId: string;
    updates?: DatasetUpdate[];
    workbookId?: string;
    parameters: DatasetField[];
    onClose: () => void;
    onApply: (args: DatasetFieldColorConfig) => void;
};

export const ColorsDialog = (props: Props) => {
    const {
        open,
        field,
        fieldUiSettings,
        datasetId,
        updates,
        workbookId,
        parameters,
        onClose,
        onApply,
    } = props;
    const [values, setValues] = React.useState<string[]>([]);
    const [selectedValue, setSelectedValue] = React.useState<string | undefined>();
    const [isLoading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    const [mountedColors, setMountedColors] = React.useState<Record<string, string>>(
        fieldUiSettings?.colors ?? {},
    );

    const colorPalettes = useSelector(selectColorPalettesDict);

    const defaultPaletteId = getTenantDefaultColorPaletteId();
    const [selectedPaletteId, setSelectedPalette] = React.useState(
        fieldUiSettings?.palette ?? defaultPaletteId,
    );

    const colorsList: string[] = getPaletteColors(selectedPaletteId, Object.values(colorPalettes));

    React.useEffect(() => {
        setSelectedValue(values?.[0] ?? undefined);
    }, [values]);

    React.useEffect(() => {
        setMountedColors(fieldUiSettings?.colors ?? {});
        setSelectedPalette(fieldUiSettings?.palette ?? defaultPaletteId);
    }, [defaultPaletteId, fieldUiSettings?.colors, fieldUiSettings?.palette]);

    const loadValues = React.useCallback(async () => {
        getSdk().cancelRequest('getDistincts');

        try {
            const resp = await getSdk().sdk.bi.getDistinctsApiV2(
                {
                    datasetId,
                    updates,
                    workbookId: workbookId ?? null,
                    limit: VALUES_LOAD_LIMIT,
                    fields: getFieldsApiV2RequestSection([field], 'distinct'),
                    parameter_values: getParametersApiV2RequestSection({
                        parameters,
                        dashboardParameters: [],
                    }),
                },
                {concurrentId: 'getDistincts', timeout: TIMEOUT_90_SEC},
            );
            const distincts = getFieldDistinctValues(field, resp.result.data.Data);
            setValues(distincts);
        } catch (e) {
            setError(e);
        }
        setLoading(false);
    }, [datasetId, field, parameters, updates, workbookId]);

    React.useEffect(() => {
        loadValues();
    }, [loadValues]);

    const handleSelectColor = (items: string[]) => {
        const colorIndex = items[0];
        if (selectedValue) {
            const newMountedColors = {...mountedColors};
            if (colorIndex) {
                newMountedColors[selectedValue] = colorIndex;
            } else {
                delete newMountedColors[selectedValue];
            }

            setMountedColors(newMountedColors);
        }
    };

    const handleSelectPalette = (palettes: string[]) => {
        setSelectedPalette(palettes[0]);
        setMountedColors({});
    };

    const handleApply = () => {
        onApply({colors: mountedColors, palette: selectedPaletteId});
    };

    const handleCancel = () => {
        onClose();
    };

    const handleReset = () => {
        setSelectedPalette(defaultPaletteId);
        setMountedColors({});
    };

    const renderValueItem = (value: string) => {
        const mountedColorIndex = mountedColors[value];
        const style: React.CSSProperties | undefined = mountedColorIndex
            ? {
                  backgroundColor: colorsList[Number(mountedColorIndex)],
              }
            : undefined;

        return (
            <React.Fragment>
                <div className={b('value-color', {default: !mountedColorIndex})} style={style}>
                    {mountedColorIndex ? null : 'a'}
                </div>
                <div className={b('value-label')} title={value}>
                    {value}
                </div>
            </React.Fragment>
        );
    };

    const paletteSelectedValue = selectedValue ? mountedColors[selectedValue] : undefined;

    const paletteOptions: PaletteOption[] = React.useMemo(() => {
        const items = colorsList.map((color, index) => ({
            content: (
                <PaletteItem
                    isSelected={String(index) === paletteSelectedValue}
                    className={b('palette-item')}
                    color={color}
                />
            ),
            value: String(index),
        }));
        items.push({
            content: (
                <PaletteItem
                    isSelected={paletteSelectedValue === undefined}
                    className={b('palette-item')}
                    isDefault={true}
                >
                    auto
                </PaletteItem>
            ),
            value: '',
        });
        return items;
    }, [colorsList, paletteSelectedValue]);

    return (
        <Dialog onClose={onClose} open={open} className={b()} disableHeightTransition={true}>
            <Dialog.Header caption={i18n('label_colors-settings')} />
            <Dialog.Body className={b('body')}>
                <div className={b('content')}>
                    <ValuesList
                        values={values}
                        isLoading={isLoading}
                        error={error ? i18n('label_error-loading-filter-values') : undefined}
                        renderItem={renderValueItem}
                        className={b('values-list')}
                        selected={selectedValue}
                        onSelect={setSelectedValue}
                    />
                    <div className={b('palette-container')}>
                        <ColorPaletteSelect
                            colorPalettes={Object.values(colorPalettes)}
                            onUpdate={handleSelectPalette}
                            value={selectedPaletteId}
                        />
                        <Palette
                            multiple={false}
                            className={b('palette')}
                            size="l"
                            options={paletteOptions}
                            value={paletteSelectedValue ? [paletteSelectedValue] : undefined}
                            onUpdate={handleSelectColor}
                        />
                    </div>
                </div>
            </Dialog.Body>
            <Dialog.Footer>
                <div className={b('footer')}>
                    <Button
                        size="l"
                        view="outlined"
                        className={b('btn-reset')}
                        onClick={handleReset}
                    >
                        {i18n('button_reset')}
                    </Button>
                    <Button size="l" view="flat" onClick={handleCancel}>
                        {i18n('button_cancel')}
                    </Button>
                    <Button size="l" view="action" onClick={handleApply}>
                        {i18n('button_apply')}
                    </Button>
                </div>
            </Dialog.Footer>
        </Dialog>
    );
};
