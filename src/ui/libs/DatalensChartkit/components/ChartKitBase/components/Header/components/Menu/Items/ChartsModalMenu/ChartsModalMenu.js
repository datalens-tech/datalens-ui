import React from 'react';

import block from 'bem-cn-lite';
import PropTypes from 'prop-types';

import './ChartsModalMenu.scss';

const b = block('charts-modal-menu');

export default class ChartsModalMenu extends React.PureComponent {
    static propTypes = {
        items: PropTypes.PropTypes.arrayOf(
            PropTypes.shape({
                val: PropTypes.string.isRequired,
                title: PropTypes.string,
                icon: PropTypes.string, // icon url
            }),
        ).isRequired,
        selected: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
    };

    state = {
        selected: this.props.selected,
    };

    _onClick = (val) => {
        this.setState({selected: val});
        this.props.onClick(val);
    };

    render() {
        return (
            <ul className={b()}>
                {this.props.items.map((item) => (
                    <li
                        className={b('item', {selected: this.state.selected === item.val})}
                        key={item.val}
                        onClick={this._onClick.bind(this, item.val)}
                    >
                        {item.icon ? (
                            <img className={b('icon')} src={item.icon} />
                        ) : (
                            <div className={b('icon', {[item.val]: true})} />
                        )}
                        <span>{item.title}</span>
                    </li>
                ))}
            </ul>
        );
    }
}
