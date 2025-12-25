import React, {PureComponent} from 'react';

import {CirclesIntersection, Ellipsis, Plus} from '@gravity-ui/icons';
import {Button, Dialog, DropdownMenu, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import DialogManager from 'components/DialogManager/DialogManager';
import {i18n} from 'i18n';
import type {DatalensGlobalState} from 'index';
import isEqual from 'lodash/isEqual';
import _pick from 'lodash/pick';
import {connect} from 'react-redux';
import type {Dataset, DatasetField, Link, LinkField} from 'shared';
import {DialogMultiDatasetQa, getResultSchemaFromDataset} from 'shared';
import {selectDatasets, selectLinks} from 'units/wizard/selectors/dataset';
import {v1 as uuidv1} from 'uuid';

import DialogLink from './DialogLink';

import './DialogMultidataset.scss';

const b = block('dialog-multidataset');

const createLinkFieldData = (field: DatasetField, dataset: Dataset): LinkField => {
    return {
        field: _pick(field, ['guid', 'title']),
        dataset: _pick(dataset, ['id', 'realName']),
    };
};

export const DIALOG_MULTIDATASET = Symbol('DIALOG_MULTIDATASET');

type StateProps = ReturnType<typeof mapStateToProps>;

interface OwnProps {
    initedDataset?: Dataset;
    onAddDatasetClick: () => void;
    onRemoveDatasetClick: (dataset: Dataset) => void;
    onApply: (args: {links: Link[]}) => void;
    onCancel: () => void;
}

interface Props extends StateProps, OwnProps {}

interface State {
    dialogLinkVisible: boolean;
    dialogLinkItem: Link | undefined;
    datasets: Dataset[] | undefined;
    links: Link[] | undefined;
}

export type OpenDialogMultidatasetArgs = {
    id: typeof DIALOG_MULTIDATASET;
    props: OwnProps;
};

class DialogMultidataset extends PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            dialogLinkVisible: false,
            dialogLinkItem: undefined,
            datasets: undefined,
            links: undefined,
        };
    }

    componentDidMount() {
        const {datasets, links, initedDataset} = this.props;

        if (initedDataset) {
            datasets.forEach((dataset) => {
                if (dataset === initedDataset) {
                    return;
                }

                getResultSchemaFromDataset(dataset).forEach((field) => {
                    // Hidden fields are not linked
                    // No measurements are not linked
                    if (field.hidden || field.type !== 'DIMENSION') {
                        return;
                    }

                    getResultSchemaFromDataset(initedDataset).forEach((fieldInInited) => {
                        // Hidden fields are not linked
                        // We automatically link only the dimensions that match by name
                        if (
                            !fieldInInited.hidden &&
                            fieldInInited.type === 'DIMENSION' &&
                            field.title === fieldInInited.title
                        ) {
                            const link = {
                                id: uuidv1(),
                                fields: {
                                    [initedDataset.id]: createLinkFieldData(
                                        fieldInInited,
                                        initedDataset,
                                    ),
                                    [dataset.id]: createLinkFieldData(field, dataset),
                                },
                            };

                            // We check whether such a connection already exists
                            if (
                                links.some((existingLink) => {
                                    const {fields} = existingLink;
                                    const initedDatasetField = fields[initedDataset.id];
                                    const datasetField = fields[dataset.id];

                                    if (initedDatasetField && datasetField) {
                                        return (
                                            initedDatasetField.field.guid === fieldInInited.guid &&
                                            initedDatasetField.dataset.id === initedDataset.id &&
                                            datasetField.field.guid === field.guid &&
                                            datasetField.dataset.id === dataset.id
                                        );
                                    } else {
                                        return false;
                                    }
                                })
                            ) {
                                // If it exists, then don't add
                                return;
                            }

                            // Adding a link
                            links.push(link);
                        }
                    });
                });
            });
        }

        this.setState({
            datasets,
            links,
        });
    }

    componentDidUpdate(prevProps: Readonly<Props>) {
        if (!isEqual(prevProps.links, this.props.links)) {
            this.setState({links: this.props.links});
        }
    }

    openDialogLink = (item?: Link) => {
        this.setState({
            dialogLinkVisible: true,
            dialogLinkItem: item,
        });
    };

    closeDialogLink = () => {
        this.setState({
            dialogLinkVisible: false,
            dialogLinkItem: undefined,
        });
    };

    renderModalBody() {
        const {datasets, links} = this.state;

        return (
            <div>
                <div className={b('left')}>
                    <div className={b('left-header')}>{i18n('wizard', 'label_datasets')}</div>
                    <div>
                        {datasets &&
                            datasets.map((dataset, i) => {
                                return (
                                    <div key={`dataset-${i}`} className={b('left-dataset')}>
                                        <div className={b('left-dataset-icon')}>
                                            <Icon data={CirclesIntersection} size={20} />
                                        </div>
                                        <div className={b('left-dataset-title')}>
                                            {dataset.realName}
                                        </div>
                                        {datasets.length > 1 && (
                                            <div className={b('left-dataset-more')}>
                                                <DropdownMenu
                                                    size="s"
                                                    renderSwitcher={({onClick, onKeyDown}) => (
                                                        <Button
                                                            qa={`dataset-${dataset.realName}`}
                                                            size="s"
                                                            view="flat"
                                                            width="max"
                                                            onClick={onClick}
                                                            onKeyDown={onKeyDown}
                                                        >
                                                            <Icon data={Ellipsis} width="16" />
                                                        </Button>
                                                    )}
                                                    items={[
                                                        {
                                                            action: () => {
                                                                this.props.onRemoveDatasetClick(
                                                                    dataset,
                                                                );
                                                            },
                                                            text: i18n('wizard', 'button_remove'),
                                                            qa: DialogMultiDatasetQa.RemoveDatasetButton,
                                                        },
                                                    ]}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        <div
                            className={b('left-dataset', 'dataset-add')}
                            onClick={this.props.onAddDatasetClick}
                        >
                            <div className={b('left-dataset-add-icon')}>
                                <Icon data={Plus} width="20" />
                            </div>
                            <div className={b('left-dataset-title')}>
                                {i18n('wizard', 'button_add-dataset')}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={b('right')}>
                    <div className={b('right-header')}>{i18n('wizard', 'label_links')}</div>
                    <div className={b('right-links')}>
                        {links && links.length ? (
                            links.map((link, i) => {
                                const fields = Object.keys(link.fields);
                                const n = fields.length - 1;

                                return (
                                    <div
                                        key={`link-${i}`}
                                        data-qa="link"
                                        className={b('right-link')}
                                    >
                                        <div
                                            className={b('right-link-formula')}
                                            onClick={() => {
                                                this.openDialogLink(link);
                                            }}
                                        >
                                            {fields.map((datasetId, j) => {
                                                const fieldsData = link.fields[datasetId];

                                                return (
                                                    <div key={`field-${j}`}>
                                                        <span
                                                            className={b(
                                                                'right-link-formula-dataset',
                                                            )}
                                                        >
                                                            {fieldsData.dataset.realName}
                                                        </span>
                                                        <span
                                                            className={b(
                                                                'right-link-formula-field',
                                                            )}
                                                        >
                                                            ({fieldsData.field.title})
                                                        </span>
                                                        {j < n && (
                                                            <span
                                                                className={b(
                                                                    'right-link-formula-equal',
                                                                )}
                                                            >
                                                                =
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div>{i18n('wizard', 'label_no-links')}</div>
                        )}
                        <div className={b('right-link')}>
                            <Button
                                size="l"
                                onClick={() => {
                                    this.openDialogLink();
                                }}
                            >
                                {i18n('wizard', 'label_add-link')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const {datasets = [], dialogLinkVisible, dialogLinkItem} = this.state;
        const newLinks = [...(this.state.links || [])];

        return (
            <Dialog open onClose={this.props.onCancel}>
                <div className={b()} data-qa={DialogMultiDatasetQa.DialogMultiDatasetRoot}>
                    <Dialog.Body>{this.renderModalBody()}</Dialog.Body>
                    <Dialog.Footer
                        preset="default"
                        onClickButtonCancel={() => {
                            this.props.onCancel();
                        }}
                        onClickButtonApply={() => {
                            const {links = []} = this.state;
                            this.props.onApply({links});
                        }}
                        propsButtonApply={{qa: DialogMultiDatasetQa.ApplyButton}}
                        textButtonApply={i18n('wizard', 'button_save')}
                        textButtonCancel={i18n('wizard', 'button_cancel')}
                    />
                    <DialogLink
                        visible={dialogLinkVisible}
                        onCancel={() => {
                            this.closeDialogLink();
                        }}
                        datasets={datasets}
                        link={dialogLinkItem}
                        onApply={({fields}: {fields: Record<string, string>}) => {
                            const formattedFieldsData: Record<string, LinkField> = {};

                            Object.keys(fields).forEach((datasetId) => {
                                const fieldGuid = fields[datasetId];
                                const dataset = datasets.find(
                                    (someDataset) => someDataset.id === datasetId,
                                )!;
                                const field = getResultSchemaFromDataset(dataset).find(
                                    (someField) => someField.guid === fieldGuid,
                                )!;

                                formattedFieldsData[datasetId] = createLinkFieldData(
                                    field,
                                    dataset,
                                );
                            });

                            let link: Link;
                            let updatedLinks: Link[];

                            if (dialogLinkItem) {
                                link = {
                                    ...dialogLinkItem,
                                    fields: formattedFieldsData,
                                };
                                updatedLinks = newLinks.map((item) =>
                                    item.id === link.id ? link : item,
                                );
                            } else {
                                link = {
                                    id: uuidv1(),
                                    fields: formattedFieldsData,
                                };

                                updatedLinks = [...newLinks, link];
                            }

                            this.setState({links: updatedLinks});

                            this.closeDialogLink();
                        }}
                        onRemoveButtonClick={() => {
                            const linkIndex = newLinks.indexOf(dialogLinkItem!);

                            newLinks.splice(linkIndex, 1);

                            this.setState({links: newLinks});

                            this.closeDialogLink();
                        }}
                    />
                </div>
            </Dialog>
        );
    }
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        datasets: selectDatasets(state),
        links: selectLinks(state),
    };
};

DialogManager.registerDialog(DIALOG_MULTIDATASET, connect(mapStateToProps)(DialogMultidataset));
