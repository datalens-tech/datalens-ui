import React from 'react';

import {ChevronDown, Ellipsis} from '@gravity-ui/icons';
import type {DropdownMenuProps} from '@gravity-ui/uikit';
import {Button, DropdownMenu, Icon, List, Popup} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {VisualizationLayerType} from 'shared';
import {getGeolayerGroups} from 'units/wizard/utils/helpers';

import DialogConfirm from '../../../../components/DialogConfirm/DialogConfirm';
import DialogGeolayer from '../../components/Dialogs/DialogGeolayer/DialogGeolayer';
import type {GeolayerSettings} from '../../typings';

import './GeolayersSelect.scss';

const b = block('geolayers-select');
const i18n = I18n.keyset('wizard');

const POPUP_OFFSET = 4;
const ITEM_HEIGHT = 28;
const DEFAULT_CONTROL_WIDTH = 256;
const DOTS_ICON_SIZE = 12;
const EMPTY_LABEL_VALUE = '—';

export interface GeolayersSelectProps {
    layers: GeolayerSettings[];
    onChange: (layerId: string) => void;
    onLayersChange: (newLayers: GeolayerSettings[]) => void;

    selectedLayerId?: string;
    controlClassName?: string;
    visualizationId: string;
}

interface GeolayersSelectState {
    active: boolean;
    dialogGeolayerVisible: boolean;
    dialogConfirmVisible: boolean;
    editableLayerId: string | null | undefined;
}

class GeolayersSelect extends React.Component<GeolayersSelectProps, GeolayersSelectState> {
    controlRef: React.RefObject<HTMLDivElement>;

    constructor(props: GeolayersSelectProps) {
        super(props);

        this.controlRef = React.createRef();

        this.state = {
            active: false,
            dialogGeolayerVisible: false,
            dialogConfirmVisible: false,
            editableLayerId: null,
        };
    }

    render() {
        const {dialogConfirmVisible} = this.state;

        return (
            <React.Fragment>
                {this.renderControl()}
                {this.renderPopup()}
                {this.renderDialogGeolayer()}
                <DialogConfirm
                    visible={dialogConfirmVisible}
                    message={i18n('label_layer-remove-confirmation')}
                    onApply={(e) => {
                        e?.stopPropagation();

                        if (this.state.editableLayerId) {
                            this.removeLayer(this.state.editableLayerId);
                        }

                        this.setState({dialogConfirmVisible: false});
                    }}
                    onCancel={(e) => {
                        e?.stopPropagation();
                        this.setState({dialogConfirmVisible: false});
                    }}
                    confirmOnEnterPress
                    isWarningConfirm={true}
                />
            </React.Fragment>
        );
    }

    get controlWidth() {
        if (!this.controlRef.current) {
            return DEFAULT_CONTROL_WIDTH;
        }

        return this.controlRef.current.getBoundingClientRect().width;
    }

    get dropdownItems(): DropdownMenuProps<string>['items'] {
        const hideRemoveItem = this.props.layers.length === 1;

        return [
            {
                action: (e, data) => {
                    e.stopPropagation();

                    this.setState({
                        active: false,
                        dialogGeolayerVisible: true,
                        editableLayerId: data,
                    });
                },
                text: i18n('label_rename'),
                qa: 'geolayer-select-option-menu-rename',
            },
            {
                action: (e, data) => {
                    e.stopPropagation();

                    this.setState({
                        active: false,
                        dialogConfirmVisible: true,
                        editableLayerId: data,
                    });
                },
                text: i18n('button_remove'),
                hidden: hideRemoveItem,
                qa: 'geolayer-select-option-menu-remove',
            },
        ];
    }

    private renderControl = () => {
        const {layers, controlClassName, selectedLayerId} = this.props;
        const {active} = this.state;

        const {name: label = EMPTY_LABEL_VALUE} =
            layers.find(({id}) => id === selectedLayerId) || {};

        return (
            <div
                ref={this.controlRef}
                className={b({active}, controlClassName)}
                data-qa="geolayers-select"
                onClick={this.togglePopupVisibility}
            >
                <div className={b('label')}>{label}</div>
                <div className={b('arrow-icon')}>
                    <Icon data={ChevronDown} />
                </div>
            </div>
        );
    };

    private renderPopup = () => {
        const {active} = this.state;

        return (
            <Popup
                style={{
                    minWidth: this.controlWidth,
                }}
                open={active}
                anchorElement={this.controlRef.current}
                offset={{mainAxis: 0, crossAxis: POPUP_OFFSET}}
                placement={'bottom-start'}
                onOpenChange={(open) => {
                    if (!open) {
                        this.togglePopupVisibility();
                    }
                }}
            >
                {this.renderPopupContent()}
            </Popup>
        );
    };

    private renderPopupContent() {
        if (this.props.visualizationId === 'combined-chart') {
            return this.renderGroup();
        }

        return getGeolayerGroups().map((group, index) => (
            <React.Fragment key={`${index}_${group}`}>{this.renderGroup(group)}</React.Fragment>
        ));
    }

    private renderGroup = (type?: VisualizationLayerType) => {
        const {layers, selectedLayerId} = this.props;

        const filteredItems = (
            type ? layers.filter((layer) => layer.type === type) : layers.slice()
        ).reverse();
        const selectedItemIndex = filteredItems.findIndex(({id}) => id === selectedLayerId);

        const popupTitle = type ? (
            <div className={b('popup-title')}>{i18n(`label_visualization-${type}`)}</div>
        ) : null;

        return (
            <React.Fragment>
                {popupTitle}
                <List
                    items={filteredItems}
                    itemClassName={b('popup-item')}
                    itemHeight={ITEM_HEIGHT}
                    itemsHeight={(items) => items.length * ITEM_HEIGHT}
                    selectedItemIndex={selectedItemIndex}
                    sortable={true}
                    filterable={false}
                    virtualized={false}
                    renderItem={(...args) => this.renderListItem(...args, filteredItems.length)}
                    onSortEnd={this.getOnListSortEndHandler(filteredItems)}
                    onItemClick={this.onChange}
                />
            </React.Fragment>
        );
    };

    private renderDialogGeolayer = () => {
        const {editableLayerId, dialogGeolayerVisible} = this.state;
        const editableLayer = this.props.layers.find(({id}) => id === editableLayerId);

        if (!editableLayer) {
            return null;
        }

        return (
            <DialogGeolayer
                layer={editableLayer}
                visible={dialogGeolayerVisible}
                onApply={(updatedLayer) => {
                    const {layers, onLayersChange} = this.props;
                    const layerToUpdateIndex = layers.findIndex(({id}) => id === updatedLayer.id);
                    const newLayers = [...layers];
                    newLayers[layerToUpdateIndex] = updatedLayer;

                    onLayersChange(newLayers);

                    this.setState({dialogGeolayerVisible: false});
                }}
                onClose={() => {
                    this.setState({dialogGeolayerVisible: false});
                }}
            />
        );
    };

    private renderDotsButton = ({onClick}: {onClick: React.MouseEventHandler<HTMLElement>}) => (
        <div className={b('button-dots-wrap')}>
            <Button
                className={b('button-dots')}
                view="flat"
                size="s"
                qa="geolayer-item-actions"
                onClick={onClick}
            >
                <Icon data={Ellipsis} size={DOTS_ICON_SIZE} />
            </Button>
        </div>
    );

    private renderListItem = (
        item: GeolayerSettings,
        _isActive: boolean,
        index: number,
        itemsLength: number,
    ) => {
        return (
            <div className={b('popup-item-content')} data-qa="geolayer-select-item">
                <div
                    data-qa={`geolayer-select-layer-${itemsLength - 1 - index}`}
                    className={b('popup-item-label')}
                >
                    {item.name}
                </div>
                <DropdownMenu
                    size="s"
                    data={item.id}
                    renderSwitcher={this.renderDotsButton}
                    items={this.dropdownItems}
                    onSwitcherClick={this.onSwitcherClick}
                />
            </div>
        );
    };

    private removeLayer = (layerId?: string) => {
        if (!layerId) {
            return;
        }

        const {layers, onLayersChange} = this.props;
        const newLayers = layers.filter(({id}) => id !== layerId);
        onLayersChange(newLayers);
    };

    private togglePopupVisibility = () => {
        this.setState({active: !this.state.active});
    };

    private onSwitcherClick = (e?: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (e) {
            e.stopPropagation();
        }
    };

    private getOnListSortEndHandler = (items: GeolayerSettings[]) => {
        return ({oldIndex, newIndex}: {oldIndex: number; newIndex: number}) => {
            const newLayers = [...this.props.layers];
            const layerOldIndex = newLayers.findIndex((layer) => layer.id === items[oldIndex].id);

            if (layerOldIndex === -1) {
                console.error('onListSortEnd failed', items);
                return;
            }

            // Multiply by -1 because the array for the group in the renderGroup method is inverted
            const indexDiff = (newIndex - oldIndex) * -1;
            const layerNewIndex = layerOldIndex + indexDiff;
            [newLayers[layerOldIndex], newLayers[layerNewIndex]] = [
                newLayers[layerNewIndex],
                newLayers[layerOldIndex],
            ];

            this.props.onLayersChange(newLayers);
        };
    };

    private onChange = (item: GeolayerSettings) => {
        const {selectedLayerId, onChange} = this.props;

        if (selectedLayerId !== item.id) {
            onChange(item.id);
        }

        this.togglePopupVisibility();
    };
}

export default GeolayersSelect;
