import React from 'react';

import {Button, MobileContext, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import PropTypes from 'prop-types';

import './Search.scss';
const trans = I18n.keyset('components.common.YCSelect');

const b = block('yc-select-search');

export class Search extends React.PureComponent {
    static propTypes = {
        value: PropTypes.string,
        width: PropTypes.number,
        minWidth: PropTypes.number,
        searchButtonSettings: PropTypes.object,
        onInputUpdate: PropTypes.func,
        selectAllItems: PropTypes.func,
        onClick: PropTypes.func,
    };

    focusInput = () => {
        if (!this.inputNode) {
            return;
        }

        this.inputNode.focus({preventScroll: true});
    };

    _setInputNode = (ref) => {
        if (!this.inputNode) {
            this.inputNode = ref;
        }
    };

    _handleOnClick = () => {
        if (this.props.onClick) {
            this.props.onClick();
        }
    };

    render() {
        const {
            value,
            width,
            minWidth,
            searchButtonSettings: {isCleaning, visible},
            onInputUpdate,
            selectAllItems,
        } = this.props;

        return (
            <MobileContext.Consumer>
                {({mobile}) => {
                    const size = mobile ? 'xl' : 'm';
                    let style;

                    if (!mobile) {
                        style = {
                            width,
                            minWidth,
                        };
                    }

                    return (
                        <div className={b()} style={style} onClick={this._handleOnClick}>
                            <div className={b('input-wrap')}>
                                <TextInput
                                    controlRef={mobile ? undefined : this._setInputNode}
                                    view="clear"
                                    size={size}
                                    value={value}
                                    placeholder={trans('search_placeholder')}
                                    onUpdate={onInputUpdate}
                                    clear
                                />
                            </div>
                            {visible && (
                                <Button view="flat" size={size} onClick={selectAllItems}>
                                    {isCleaning
                                        ? trans('search_clear')
                                        : trans('search_select_all')}
                                </Button>
                            )}
                        </div>
                    );
                }}
            </MobileContext.Consumer>
        );
    }
}
