import React from 'react';

import block from 'bem-cn-lite';
import PropTypes from 'prop-types';

import {getDefaultPreset} from '../utils';

import './Presets.scss';

const b = block('yc-datepicker-presets');

export class Presets extends React.PureComponent {
    static propTypes = {
        zone: PropTypes.string,
        activeTab: PropTypes.string,
        range: PropTypes.bool,
        onRangeDateClick: PropTypes.func,
    };

    renderPresetItem({title, start, end}) {
        const presetTitle = typeof title === 'function' ? title() : title;

        return (
            <div
                key={presetTitle}
                className={b('item')}
                onClick={() =>
                    this.props.onRangeDateClick({
                        start,
                        end,
                        isAllRangePicked: true,
                        scrollCalendar: true,
                    })
                }
            >
                {presetTitle}
            </div>
        );
    }

    render() {
        const {zone, activeTab, range} = this.props;

        return (
            <div className={b()}>
                {getDefaultPreset({zone, activeTab, range}).map((preset) =>
                    this.renderPresetItem(preset),
                )}
            </div>
        );
    }
}
