import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Flex} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import cloneDeep from 'lodash/cloneDeep';
import type {DatasetOptions, Field, FilterField, LineShapeType, Update} from 'shared';
import {DialogLineShapesQa} from 'shared';
import {selectClientAvailableLineShapes} from 'ui/constants';
import {getShapedLineIcon} from 'ui/utils/line-shapes';

import ValuesList from '../../../../ValuesList/ValuesList';
import {i18n} from '../../i18n';
import type {ShapesState} from '../../types';
import {LineWidthControl} from '../LineWidth/LineWidth';
import {ShapesPalette} from '../ShapesPalette/ShapesPalette';

const b = block('dialog-line-shapes');

export const LineSettings = ({
    item,
    items,
    distincts,
    options,
    datasetId,
    updates,
    filters,
    value: state,
    parameters,
    dashboardParameters,
    onChange,
}: {
    item: Field;
    items?: Field[];
    distincts?: Record<string, string[]>;
    options: DatasetOptions;
    parameters: Field[];
    dashboardParameters: Field[];
    datasetId: string;
    updates: Update[];
    filters: FilterField[];
    value: ShapesState;
    onChange: (value: ShapesState) => void;
}) => {
    const mountedShapes = React.useMemo(() => state.mountedShapes ?? {}, [state.mountedShapes]);
    const palette: string[] = React.useMemo(() => selectClientAvailableLineShapes(), []);

    const renderValueItem = React.useCallback(
        (value) => {
            const currentShape = mountedShapes?.[value];
            const hasMountedShape = currentShape && palette.includes(currentShape);
            const mountedLineWidth = state.lineSettings?.[value]?.lineWidth ?? 'auto';
            const hasMountedLineSettings = mountedLineWidth !== 'auto';

            return (
                <div className={b('value-list-row')}>
                    <div
                        className={b('default-value-icon', {
                            'crossed-out': hasMountedShape || hasMountedLineSettings,
                        })}
                    >
                        A
                    </div>
                    <div className={b('value-label')} title={value}>
                        {value}
                    </div>
                    {hasMountedShape && (
                        <div className={b('value-shape')}>
                            {getShapedLineIcon({
                                height: mountedLineWidth === 'auto' ? 2 : Number(mountedLineWidth),
                                shape: currentShape as LineShapeType,
                                width: 80,
                            })}
                        </div>
                    )}
                </div>
            );
        },
        [mountedShapes, palette, state.lineSettings],
    );

    const handleChangeSelectedValue = React.useCallback(
        (selected: string | null, shouldClearPalette?: boolean | undefined) => {
            const stateUpdates: Partial<ShapesState> = {
                selected,
            };

            if (shouldClearPalette) {
                stateUpdates.mountedShapes = {};
            }

            onChange({
                ...state,
                ...stateUpdates,
            });
        },
        [onChange, state],
    );

    const onPaletteItemClick = React.useCallback(
        (shape: string) => {
            if (!state.selected) {
                return;
            }

            const mountedShapesUpdates = cloneDeep(mountedShapes);
            const isDefaultValue = shape === 'auto';
            if (isDefaultValue) {
                delete mountedShapesUpdates[state.selected];
            } else {
                mountedShapesUpdates[state.selected] = shape;
            }

            onChange({...state, mountedShapes: mountedShapesUpdates});
        },
        [mountedShapes, onChange, state],
    );

    const handleChangeLineWidth = React.useCallback(
        (value: number | 'auto' | undefined) => {
            if (!state.selected) {
                return;
            }

            const updatedState = {
                ...state,
                lineSettings: {
                    ...state.lineSettings,
                    [state.selected]: {
                        ...state.lineSettings?.[state.selected],
                        lineWidth: value,
                    },
                },
            };

            onChange(updatedState);
        },
        [onChange, state],
    );

    const selectedLineWidth =
        (state.selected ? state.lineSettings[state.selected]?.lineWidth : undefined) ?? 'auto';

    return (
        <Flex direction="row" height="100%">
            <ValuesList
                item={item}
                items={items}
                distincts={distincts}
                filters={filters}
                parameters={parameters}
                dashboardParameters={dashboardParameters}
                updates={updates}
                options={options}
                datasetId={datasetId}
                selectedValue={state.selected}
                renderValueItem={renderValueItem}
                onChangeSelectedValue={handleChangeSelectedValue}
                qa={DialogLineShapesQa.ValueList}
            />
            <div className={b('line-settings')}>
                <FormRow label={i18n('label_line-width')} className={b('form-row')}>
                    <LineWidthControl
                        defaultValue={state.commonLineSettings?.lineWidth}
                        value={selectedLineWidth}
                        onChange={handleChangeLineWidth}
                    />
                </FormRow>
                <ShapesPalette shapesState={state} onPaletteItemClick={onPaletteItemClick} />
            </div>
        </Flex>
    );
};
