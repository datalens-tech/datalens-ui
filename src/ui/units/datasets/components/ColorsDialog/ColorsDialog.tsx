import React from 'react';

import {Button, Dialog, Palette} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {DatasetField, DatasetFieldColorConfig} from 'shared';
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
import {fetchColorPalettes} from 'ui/store/actions/colorPaletteEditor';
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
    datasetId: string;
    workbookId?: string;
    parameters: DatasetField[];
    onClose: () => void;
    onApply: (args: DatasetFieldColorConfig) => void;
};

export const ColorsDialog = (props: Props) => {
    const {open, field, datasetId, workbookId, parameters, onClose, onApply} = props;
    const [values, setValues] = React.useState<string[]>([]);
    const [selectedValue, setSelectedValue] = React.useState<string | undefined>();
    const [isLoading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [mountedColors, setMountedColors] = React.useState<Record<string, string>>({});

    const dispatch = useDispatch();
    const colorPalettes = useSelector(selectColorPalettesDict);
    React.useEffect(() => {
        if (!colorPalettes.length) {
            dispatch(fetchColorPalettes());
        }
    }, [colorPalettes.length, dispatch]);

    const defaultPaletteId = getTenantDefaultColorPaletteId();
    const [selectedPaletteId, setSelectedPalette] = React.useState(defaultPaletteId);

    const colorsList: string[] = getPaletteColors(selectedPaletteId, Object.values(colorPalettes));

    React.useEffect(() => {
        if (values.length) {
            setSelectedValue(values[0]);
        }
    }, [values]);

    const loadValues = React.useCallback(async () => {
        getSdk().cancelRequest('getDistincts');

        try {
            const resp = await getSdk().sdk.bi.getDistinctsApiV2(
                {
                    datasetId,
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
    }, [datasetId, field, parameters, workbookId]);

    React.useEffect(() => {
        loadValues();
    }, [loadValues]);

    const handleSelectColor = (items: string[]) => {
        if (selectedValue) {
            setMountedColors({
                ...mountedColors,
                [selectedValue]: items[0],
            });
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

    const handleReset = () => {};

    const renderValueItem = (value: string) => {
        const mountedColorIndex = mountedColors[value];

        return (
            <React.Fragment>
                <div
                    className={b('value-color', {default: !mountedColorIndex})}
                    style={{
                        backgroundColor: colorsList[Number(mountedColorIndex)],
                    }}
                >
                    {mountedColorIndex ? null : 'a'}
                </div>
                <div className={b('value-label')} title={value}>
                    {value}
                </div>
            </React.Fragment>
        );
    };

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
                            options={colorsList.map((color, index) => ({
                                content: (
                                    <PaletteItem className={b('palette-item')} color={color} />
                                ),
                                value: String(index),
                            }))}
                            disabled={false}
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
