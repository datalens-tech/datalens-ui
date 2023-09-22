import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import PropTypes from 'prop-types';

import Attach from '../Attach/Attach';
import ColorItem from '../ColorItem/ColorItem';

import './PaletteSettings.scss';

const b = block('palette-settings');

function PaletteSettings({colors, onColorChange, saveFile, loadFile}) {
    const middleIndex = Math.floor(colors.length / 2);

    return (
        <div className={b()}>
            <div className={b('container')}>
                <div className={b('colors-list')}>
                    <div>
                        {colors.slice(0, middleIndex).map((color, index) => (
                            <ColorItem
                                key={index}
                                color={color}
                                handleColorChange={onColorChange}
                                itemIndex={index}
                            />
                        ))}
                    </div>
                    <div>
                        {colors.slice(middleIndex).map((color, index) => (
                            <ColorItem
                                key={middleIndex + index}
                                color={color}
                                handleColorChange={onColorChange}
                                itemIndex={middleIndex + index}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <div className={b('actions')}>
                <div className={b('action')}>
                    <Button view="action" size="l" onClick={saveFile}>
                        Save to file
                    </Button>
                </div>
                <div className={b('action')}>
                    <Attach onChange={loadFile} />
                </div>
            </div>
        </div>
    );
}

PaletteSettings.propTypes = {
    colors: PropTypes.arrayOf(PropTypes.string).isRequired,
    onColorChange: PropTypes.func.isRequired,
    saveFile: PropTypes.func.isRequired,
    loadFile: PropTypes.func.isRequired,
};

export default PaletteSettings;
