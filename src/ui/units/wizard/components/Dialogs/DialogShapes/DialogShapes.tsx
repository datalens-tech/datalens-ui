import React from 'react';

import {Shapes4} from '@gravity-ui/icons';
import {Button, Dialog, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import DialogManager from 'components/DialogManager/DialogManager';
import {i18n} from 'i18n';
import type {DatasetOptions, Field, FilterField, ShapesConfig, Update} from 'shared';

import type {PaletteTypes} from '../../../constants';

import DialogShapesPalette from './DialogShapesPalette/DialogShapesPalette';

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
    const [shapesState, setShapesState] = React.useState<ShapesState>({
        selectedValue: null,
        mountedShapes:
            shapesConfig.mountedShapes && Object.keys(shapesConfig.mountedShapes)
                ? shapesConfig.mountedShapes
                : {},
    });

    const onPaletteItemClick = React.useCallback(
        (shape: string) => {
            const {selectedValue} = shapesState;

            if (!selectedValue) {
                return;
            }

            const mountedShapes = {...shapesState.mountedShapes};
            const isDefaultValue = shape === 'auto';
            if (isDefaultValue) {
                delete mountedShapes[selectedValue];
            } else {
                mountedShapes[selectedValue] = shape;
            }

            setShapesState((prevState) => ({...prevState, mountedShapes}));
        },
        [shapesState],
    );

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
            fieldGuid: item.guid,
        };
        onApply(shapesConfig);
        onClose();
    }, [item.guid, onApply, onClose, shapesState.mountedShapes]);

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
                    <DialogShapesPalette
                        parameters={parameters}
                        dashboardParameters={dashboardParameters}
                        shapesState={shapesState}
                        setShapesState={(state) =>
                            setShapesState((prevState) => ({...prevState, ...state}))
                        }
                        onPaletteItemClick={onPaletteItemClick}
                        distincts={distincts}
                        items={items}
                        item={item}
                        datasetId={datasetId}
                        updates={updates}
                        filters={filters}
                        options={options}
                        paletteType={paletteType}
                    />
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
