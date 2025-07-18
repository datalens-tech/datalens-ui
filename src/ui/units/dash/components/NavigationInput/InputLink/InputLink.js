import React from 'react';

import {Button, Popup, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import PropTypes from 'prop-types';
import {EntryScope, NavigationInputQA} from 'shared';
import {KeyCodes} from 'ui';
import {EntryTypeNode} from 'units/dash/modules/constants';

import logger from '../../../../../libs/logger';
import {getSdk} from '../../../../../libs/schematic-sdk';

import './InputLink.scss';

const ERROR = {
    INPUT_LINK_INCORRECT: {
        key: 'INPUT_LINK_INCORRECT',
        get text() {
            return i18n('dash.navigation-input.edit', 'toast_incorrect-url');
        },
    },
    INPUT_LINK_INCORRECT_SOURCE: {
        key: 'INPUT_LINK_INCORRECT_SOURCE',
        get text() {
            return i18n('dash.navigation-input.edit', 'toast_incorrect-source');
        },
    },
    INPUT_LINK_NOT_SELECTOR: {
        key: 'INPUT_LINK_NOT_SELECTOR',
        get text() {
            return i18n('dash.navigation-input.edit', 'toast_not-selector');
        },
    },
    INPUT_LINK_NOT_FOUND: {
        key: 'INPUT_LINK_NOT_FOUND',
        get text() {
            return i18n('dash.navigation-input.edit', 'toast_not-found');
        },
    },
    INPUT_LINK_APPLY: {
        key: 'INPUT_LINK_APPLY',
        get text() {
            return i18n('dash.navigation-input.edit', 'toast_error');
        },
    },
    INPUT_LINK_WRONG_WORKBOOK_ID: {
        key: 'INPUT_LINK_WRONG_WORKBOOK_ID',
        get text() {
            return i18n('dash.navigation-input.edit', 'toast_wrong-workbook-id');
        },
    },
};

const b = block('input-link');

class InputLink extends React.PureComponent {
    static propTypes = {
        onApply: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
        includeType: PropTypes.oneOf(Object.values(EntryTypeNode)),
        excludeType: PropTypes.oneOf(Object.values(EntryTypeNode)),
        workbookId: PropTypes.string.isRequired,
        scope: PropTypes.oneOf(Object.values(EntryScope)),
    };

    state = {
        value: '',
        progress: false,
        error: null,
    };

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    mounted = false;

    applyButtonRef = React.createRef();

    onApply = async () => {
        const {includeType, excludeType, workbookId, scope} = this.props;

        try {
            this.setState({progress: true});
            const {entry, params} = await getSdk().sdk.mix.resolveEntryByLink({
                url: this.state.value,
            });

            if (workbookId && workbookId !== entry.workbookId) {
                this.setState({error: ERROR.INPUT_LINK_WRONG_WORKBOOK_ID.key});
            } else if (includeType && entry.type !== includeType) {
                const errorKey =
                    includeType === EntryTypeNode.CONTROL_NODE
                        ? ERROR.INPUT_LINK_NOT_SELECTOR.key
                        : ERROR.INPUT_LINK_INCORRECT_SOURCE.key;
                this.setState({error: errorKey});
            } else if ((excludeType && entry.type === excludeType) || scope !== entry.scope) {
                this.setState({error: ERROR.INPUT_LINK_INCORRECT_SOURCE.key});
            } else {
                this.props.onApply({entry, params});
            }
        } catch (error) {
            let errorCode = 'INPUT_LINK_INCORRECT';
            if (error && error.status === 404) {
                errorCode = 'INPUT_LINK_NOT_FOUND';
            }

            logger.logError('InputLink: resolveEntryByLink failed', error);
            console.error(errorCode, error);
            this.setState({error: ERROR[errorCode].key});
        }

        if (this.mounted) {
            this.setState({progress: false});
        }
    };

    onKeyUp = (event) => {
        if (event.keyCode === KeyCodes.ENTER && event.target.value) {
            this.onApply();
        }
    };

    render() {
        return (
            <React.Fragment>
                <TextInput
                    className={b('input')}
                    qa={NavigationInputQA.Input}
                    placeholder={i18n('dash.navigation-input.edit', 'context_fill-link')}
                    value={this.state.value}
                    disabled={this.state.progress}
                    autoFocus={true}
                    onKeyUp={this.onKeyUp}
                    onUpdate={(value) => this.setState({value})}
                />
                <div className={b('buttons-container')}>
                    <Button
                        view="action"
                        className={b('button')}
                        qa={NavigationInputQA.Apply}
                        disabled={this.state.progress}
                        loading={this.state.progress}
                        onClick={this.onApply}
                        ref={this.applyButtonRef}
                    >
                        {i18n('dash.navigation-input.edit', 'button_ok')}
                    </Button>
                    <Button
                        view="flat"
                        disabled={this.state.progress}
                        onClick={this.props.onCancel}
                        className={b('button')}
                    >
                        {i18n('dash.navigation-input.edit', 'button_cancel')}
                    </Button>
                </div>
                <Popup
                    hasArrow={true}
                    anchorElement={this.applyButtonRef.current}
                    open={Boolean(this.state.error)}
                    placement="bottom"
                    onOpenChange={(open) => {
                        if (!open) {
                            this.setState({error: null});
                        }
                    }}
                >
                    <div className={b('error')}>
                        {this.state.error && ERROR[this.state.error].text}
                    </div>
                </Popup>
            </React.Fragment>
        );
    }
}

export default InputLink;
