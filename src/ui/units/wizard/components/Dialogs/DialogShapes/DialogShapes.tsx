import React from 'react';

import {Shapes4} from '@gravity-ui/icons';
import {Button, Dialog, Flex, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import DialogManager from 'components/DialogManager/DialogManager';
import {i18n} from 'i18n';
import type {DatasetOptions, Field, FilterField, ShapesConfig, Update} from 'shared';
import {LINE_WIDTH_DEFAULT_VALUE} from 'ui/units/wizard/constants/shapes';

import {PaletteTypes} from '../../../constants';

import {DialogLineWidth} from './DialogLineWidth/DialogLineWidth';
import DialogShapesPalette from './DialogShapesPalette/DialogShapesPalette';
import {DialogValueList} from './DialogValueList/DialogValueList';

import './DialogShapes.scss';

export const DIALOG_SHAPES = Symbol('DIALOG_SHAPES');

const b = block('dialog-shapes');

type Props = {
    item: Field;
    items?: Field[];
    distincts?: Record<string, string[]>;
    options: DatasetOptions;
    parameters: Field[];
    dashboardParameters: Field[];
    datasetId: string;
    updates: Update[];
    filters: FilterField[];
    onApply: (shapesConfig: ShapesConfig) => void;
    onCancel: () => void;
    shapesConfig: ShapesConfig;
    paletteType: PaletteTypes;
};

export type OpenDialogShapesArgs = {
    id: typeof DIALOG_SHAPES;
    props: Props;
};

export type ShapesState = {
    mountedShapes: Record<string, string>;
    mountedShapesLineWidths: Record<string, number>;
    selectedValue: string | null;
};

const DialogShapes: React.FC<Props> = ({
    item,
    items,
    distincts,
    options,
    datasetId,
    updates,
    filters,
    onApply,
    shapesConfig,
    parameters,
    dashboardParameters,
    onCancel,
    paletteType,
}: Props) => {
    const [shapesState, setShapesState] = React.useState<ShapesState>(() => {
        const mountedShapes =
            shapesConfig.mountedShapes && Object.keys(shapesConfig.mountedShapes)
                ? shapesConfig.mountedShapes
                : {};
        const mountedShapesLineWidths =
            shapesConfig.mountedShapesLineWidths &&
            Object.keys(shapesConfig.mountedShapesLineWidths)
                ? shapesConfig.mountedShapesLineWidths
                : {};

        return {
            selectedValue: null,
            mountedShapes,
            mountedShapesLineWidths,
        };
    });

    const onPaletteItemClick = React.useCallback(
        (shape: string) => {
            const {selectedValue} = shapesState;

            if (!selectedValue) {
                return;
            }

            const mountedShapes = {...shapesState.mountedShapes};
            const mountedShapesLineWidths = {...shapesState.mountedShapesLineWidths};
            const isDefaultValue = shape === 'auto';
            if (isDefaultValue) {
                delete mountedShapes[selectedValue];
            } else {
                mountedShapes[selectedValue] = shape;
                mountedShapesLineWidths[selectedValue] =
                    mountedShapesLineWidths[selectedValue] || LINE_WIDTH_DEFAULT_VALUE;
            }

            setShapesState((prevState) => ({...prevState, mountedShapes, mountedShapesLineWidths}));
        },
        [shapesState],
    );

    const onLineWidthChange = React.useCallback((nextLineWidth: number) => {
        setShapesState((prevState) => ({
            ...prevState,
            lineWidth: nextLineWidth,
            mountedShapesLineWidths: {
                ...prevState.mountedShapesLineWidths,
                ...(prevState.selectedValue ? {[prevState.selectedValue]: nextLineWidth} : {}),
            },
        }));
    }, []);

    const onReset = React.useCallback(() => {
        setShapesState((prevState) => ({...prevState, mountedShapes: {}}));
    }, []);

    const onClose = React.useCallback(() => {
        onCancel();
    }, [onCancel]);

    const onCancelButtonClick = React.useCallback(() => {
        onClose();
    }, [onClose]);

    const onApplyButtonClick = React.useCallback(() => {
        const shapesConfig: ShapesConfig = {
            mountedShapes: shapesState.mountedShapes,
            mountedShapesLineWidths: shapesState.mountedShapesLineWidths,
            fieldGuid: item.guid,
        };
        onApply(shapesConfig);
        onClose();
    }, [
        item.guid,
        onApply,
        onClose,
        shapesState.mountedShapes,
        shapesState.mountedShapesLineWidths,
    ]);

    const selectedShapeLineWidth =
        shapesState.selectedValue && shapesState.mountedShapesLineWidths[shapesState.selectedValue]
            ? shapesState.mountedShapesLineWidths[shapesState.selectedValue]
            : LINE_WIDTH_DEFAULT_VALUE;

    return (
        <Dialog onClose={onClose} open={true}>
            <div className={b()}>
                <Dialog.Header
                    insertBefore={
                        <div className={b('title-icon')}>
                            <Icon data={Shapes4} size={18} />
                        </div>
                    }
                    caption={i18n('wizard', 'label_shapes-settings')}
                />
                <Dialog.Body>
                    <DialogValueList
                        item={item}
                        items={items}
                        distincts={distincts}
                        filters={filters}
                        parameters={parameters}
                        dashboardParameters={dashboardParameters}
                        updates={updates}
                        options={options}
                        datasetId={datasetId}
                        shapesState={shapesState}
                        paletteType={paletteType}
                        setShapesState={(state) =>
                            setShapesState((prevState) => ({...prevState, ...state}))
                        }
                    />
                    <Flex direction="column" gap={4} spacing={{py: '5', px: '6'}}>
                        {paletteType === PaletteTypes.Lines && (
                            <DialogLineWidth
                                value={selectedShapeLineWidth}
                                onChange={onLineWidthChange}
                            />
                        )}
                        <DialogShapesPalette
                            shapesState={shapesState}
                            onPaletteItemClick={onPaletteItemClick}
                            paletteType={paletteType}
                        />
                    </Flex>
                </Dialog.Body>
                <Dialog.Footer
                    preset="default"
                    showError={false}
                    onClickButtonCancel={onCancelButtonClick}
                    onClickButtonApply={onApplyButtonClick}
                    textButtonApply={i18n('wizard', 'button_apply')}
                    textButtonCancel={i18n('wizard', 'button_cancel')}
                >
                    <Button
                        view="outlined"
                        size="l"
                        disabled={
                            shapesState.mountedShapes &&
                            !Object.keys(shapesState.mountedShapes).length
                        }
                        onClick={onReset}
                    >
                        {i18n('wizard', 'button_reset')}
                    </Button>
                </Dialog.Footer>
            </div>
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_SHAPES, React.memo(DialogShapes));
