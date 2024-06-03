import React from 'react';

import {CirclesIntersection} from '@gravity-ui/icons';
import type {SelectOption} from '@gravity-ui/uikit';
import {Button, Dialog, Icon, Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import type {Dataset, Field, Link} from 'shared';
import {DialogLinkQa, getResultSchemaFromDataset} from 'shared';
import {withHiddenUnmount} from 'ui';

import {isFieldVisible} from '../../utils/wizard';

import './DialogLink.scss';

const b = block('dialog-link');

interface Props {
    visible: boolean;
    datasets: Dataset[];
    link: Link | undefined;
    onCancel: () => void;
    onApply: (args: {fields: Record<string, string>}) => void;
    onRemoveButtonClick: () => void;
}

interface State {
    fields: Record<string, string>;
    valid: boolean;
}

class DialogLink extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        const {link} = this.props;

        let valid = false;

        const fields: Record<string, string> = {};

        if (link) {
            Object.keys(link.fields).forEach((datasetId) => {
                fields[datasetId] = link.fields[datasetId].field.guid;
            });

            valid = true;
        }

        this.state = {
            fields,
            valid,
        };
    }

    renderModalBody() {
        const {datasets} = this.props;
        const {fields, valid} = this.state;

        return (
            <div>
                {datasets &&
                    datasets.map((dataset, i) => {
                        const {id: datasetId} = dataset;
                        const sortedSchema = getResultSchemaFromDataset(dataset)
                            .filter((field) => {
                                return isFieldVisible(field as Field);
                            })
                            .sort((a, b) => {
                                return a.title > b.title ? 1 : -1;
                            });

                        const titleByGuid: Record<string, string> = {};

                        const options: SelectOption[] = sortedSchema.map((item): SelectOption => {
                            const {guid, title} = item;

                            titleByGuid[guid] = title;

                            return {
                                value: guid,
                                content: title,
                            };
                        });

                        return (
                            <div key={`dataset-${i}`} className={b('dataset')}>
                                <div className={b('dataset-icon')}>
                                    <Icon data={CirclesIntersection} size={20} />
                                </div>
                                <div className={b('dataset-title')}>{dataset.realName}</div>
                                <div className={b('dataset-fields')}>
                                    <Select
                                        qa={dataset.realName}
                                        value={fields[datasetId] ? [fields[datasetId]] : []}
                                        placeholder={titleByGuid[fields[datasetId]]}
                                        className={b('select')}
                                        popupClassName={b('select-popup')}
                                        onUpdate={([field]) => {
                                            const newFields = {
                                                ...fields,
                                                [datasetId]: field,
                                            };

                                            this.setState({
                                                fields: newFields,
                                                valid: valid || Object.keys(newFields).length > 1,
                                            });
                                        }}
                                        options={options}
                                    />
                                </div>
                            </div>
                        );
                    })}
            </div>
        );
    }

    render() {
        const {link} = this.props;
        const {valid} = this.state;

        return (
            <Dialog open={this.props.visible} onClose={this.props.onCancel} qa="dialog-link">
                <div className={b()}>
                    <Dialog.Header caption={i18n('wizard', 'label_links-between-sources')} />
                    <Dialog.Body>{this.renderModalBody()}</Dialog.Body>
                    <Dialog.Footer
                        preset="default"
                        onClickButtonCancel={() => {
                            this.props.onCancel();
                        }}
                        onClickButtonApply={() => {
                            this.props.onApply(this.state);
                        }}
                        propsButtonApply={{
                            disabled: !valid,
                            qa: DialogLinkQa.ApplyButton,
                        }}
                        textButtonApply={i18n('wizard', 'button_save')}
                        textButtonCancel={i18n('wizard', 'button_cancel')}
                    >
                        {link && (
                            <Button
                                view="outlined"
                                size="l"
                                onClick={this.props.onRemoveButtonClick}
                            >
                                {i18n('wizard', 'button_remove')}
                            </Button>
                        )}
                    </Dialog.Footer>
                </div>
            </Dialog>
        );
    }
}

export default withHiddenUnmount(DialogLink);
