import React from 'react';

import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import moment from 'moment';
import {registry} from 'ui/registry';
import {DATE_FORMAT} from 'ui/store/constants/controlDialog';

import Dialog from '../../../Dialog/Dialog';
import Button from '../../Switchers/Button/Button';

import './Acceptable.scss';

const {Datepicker} = registry.common.components.getAll();

const b = block('date-acceptable');

interface AcceptableValues {
    from?: string;
    to?: string;
}

interface AcceptableProps {
    acceptableValues: AcceptableValues;
    onApply: ({acceptableValues}: {acceptableValues: AcceptableValues}) => void;
}

interface AcceptableState {
    showDialog: boolean;
    acceptableValues: AcceptableValues;
}

class Acceptable extends React.PureComponent<AcceptableProps, AcceptableState> {
    static defaultProps: Partial<AcceptableProps> = {
        acceptableValues: {},
    };

    state: AcceptableState = {
        showDialog: false,
        acceptableValues: this.props.acceptableValues,
    };

    render() {
        const {
            acceptableValues: {from, to},
        } = this.props;

        let text = i18n('dash.control-dialog.edit', 'value_date-no-limits');

        if (from && to) {
            text = `${moment.utc(from).format(DATE_FORMAT)} - ${moment
                .utc(to)
                .format(DATE_FORMAT)}`;
        } else if (from) {
            text = `${moment.utc(from).format(DATE_FORMAT)} - ${text}`;
        } else if (to) {
            text = `${text} - ${moment.utc(to).format(DATE_FORMAT)}`;
        }

        return (
            <React.Fragment>
                <Button
                    title={i18n('dash.control-dialog.edit', 'field_acceptable-values')}
                    text={text}
                    onClick={() => {
                        this.setState({showDialog: !this.state.showDialog});
                    }}
                />
                {this.renderDialog()}
            </React.Fragment>
        );
    }

    closeDialog = () => this.setState({showDialog: false});

    renderBody() {
        const {acceptableValues} = this.state;
        return (
            <React.Fragment>
                <div className={b('row')}>
                    <div className={b('title')}>
                        {i18n('dash.control-dialog.edit', 'field_date-from')}
                    </div>
                    <div className={b('value')}>
                        <Datepicker
                            from={acceptableValues.from || ''}
                            scale="day"
                            range={false}
                            timezoneOffset={0}
                            allowNullableValues={true}
                            emptyValueText={i18n(
                                'dash.control-dialog.edit',
                                'value_date-no-limits',
                            )}
                            onUpdate={({from}) =>
                                this.setState({
                                    acceptableValues: {...acceptableValues, from: from || ''},
                                })
                            }
                        />
                    </div>
                </div>
                <div className={b('row')}>
                    <div className={b('title')}>
                        {i18n('dash.control-dialog.edit', 'field_date-to')}
                    </div>
                    <div className={b('value')}>
                        <Datepicker
                            from={acceptableValues.to || ''}
                            scale="day"
                            range={false}
                            timezoneOffset={0}
                            allowNullableValues={true}
                            emptyValueText={i18n(
                                'dash.control-dialog.edit',
                                'value_date-no-limits',
                            )}
                            onUpdate={({from: to}) =>
                                this.setState({
                                    acceptableValues: {...acceptableValues, to: to || ''},
                                })
                            }
                        />
                    </div>
                </div>
            </React.Fragment>
        );
    }

    renderDialog() {
        const {onApply} = this.props;
        const {showDialog, acceptableValues} = this.state;
        return (
            <Dialog
                visible={showDialog}
                caption={i18n('dash.control-dialog.edit', 'label_acceptable-values')}
                onApply={() => {
                    onApply({acceptableValues});
                    this.closeDialog();
                }}
                onClose={this.closeDialog}
            >
                {this.renderBody()}
            </Dialog>
        );
    }
}

export default Acceptable;
