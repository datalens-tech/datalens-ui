import React from 'react';

import {Icon, Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import PropTypes from 'prop-types';

import {registry} from '../../../registry';
import {getPlaceConfig} from '../Base/configure';
import {PLACE} from '../constants';

import './PlaceSelect.scss';

const b = block('dl-navigation-minimal-place-select');

export default class PlaceSelect extends React.PureComponent {
    static propTypes = {
        place: PropTypes.string,
        path: PropTypes.string,
        items: PropTypes.arrayOf(PropTypes.string),
        quickItems: PropTypes.arrayOf(PropTypes.string),
        onChange: PropTypes.func,
    };

    _getItemsConfig() {
        const {items} = this.props;

        const {getNavigationPlacesConfig} = registry.common.functions.getAll();

        const placesConfig = getNavigationPlacesConfig();

        return items.map((item) => getPlaceConfig({place: item, placesConfig}));
    }

    _getQuickItemsConfig() {
        const {quickItems} = this.props;
        const {getNavigationQuickItems} = registry.common.functions.getAll();
        const config = getNavigationQuickItems();
        return quickItems.map((key) => config.find((itemConfig) => itemConfig.key === key));
    }

    _getFullConfig() {
        const {quickItems} = this.props;
        const itemsConfig = this._getItemsConfig();
        return quickItems ? itemsConfig.concat(this._getQuickItemsConfig()) : itemsConfig;
    }

    _getQuickItem() {
        const {path, quickItems} = this.props;

        if (!quickItems) {
            return null;
        }

        return this._getQuickItemsConfig().find((itemConfig) => itemConfig.key === path);
    }

    _getSelectItems() {
        return this._getFullConfig().map(({place, text, icon, key, iconClassName, qa}) => {
            return {
                value: place || key,
                content: (
                    <div className={b('option')} data-qa="navigation-minimal-place-select-option">
                        <Icon data={icon} className={iconClassName} size="16" />
                        <div data-qa={qa} className={b('option-text')}>
                            {text}
                        </div>
                    </div>
                ),
            };
        });
    }

    _onChange = ([value]) => {
        const {key} = this._getFullConfig().find(
            ({place, key}) => place === value || key === value,
        );

        this.props.onChange({
            path: key,
            root: key ? PLACE.ROOT : value,
        });
    };

    renderOption(option) {
        return option.content;
    }

    render() {
        const {place} = this.props;
        const quickItem = this._getQuickItem();

        return (
            <div className={b()}>
                <Select
                    qa="navigation-minimal-place-select"
                    popupClassName={b('popup')}
                    className={b('select')}
                    options={this._getSelectItems()}
                    value={quickItem ? [quickItem.key] : [place]}
                    onUpdate={this._onChange}
                    renderOption={this.renderOption}
                    renderSelectedOption={this.renderOption}
                />
            </div>
        );
    }
}
