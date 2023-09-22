import React from 'react';

import block from 'bem-cn-lite';
import PropTypes from 'prop-types';

import './ColorItem.scss';

const b = block('color-item');

export default class ColorItem extends React.PureComponent {
    static propTypes = {
        handleColorChange: PropTypes.func.isRequired,
        color: PropTypes.string.isRequired,
        itemIndex: PropTypes.number.isRequired,
    };

    inputRef = React.createRef();

    onColorChange = (event) => {
        this.props.handleColorChange(event.target.value, this.props.itemIndex);
    };

    onPreviewClick = () => {
        this.inputRef.current.click();
    };

    render() {
        const {color, itemIndex} = this.props;

        return (
            <div className={b()}>
                <div
                    className={b('preview')}
                    style={{backgroundColor: color}}
                    onClick={this.onPreviewClick}
                >
                    <input
                        ref={this.inputRef}
                        className={b('input')}
                        id={itemIndex}
                        type="color"
                        value={color}
                        onChange={this.onColorChange}
                    />
                </div>
                <div className={b('code')}>{color}</div>
            </div>
        );
    }
}
