import React from 'react';

import Highcharts from 'highcharts';
import debounce from 'lodash/debounce';
import moment from 'moment';
import PropTypes from 'prop-types';
import {DndProvider} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import {i18n} from '../../../ChartKit/modules/i18n/i18n';
import draggableModalHOC from '../DraggableModalHOC/DraggableModalHOC';
import PaletteSettings from '../PaletteSettings/PaletteSettings';

const DraggablePaletteSettings = draggableModalHOC(PaletteSettings);

export default class PaletteEditor extends React.PureComponent {
    static propTypes = {
        colors: PropTypes.arrayOf(PropTypes.string),
    };

    static defaultProps = {
        colors: Highcharts.getOptions?.().colors || [],
    };

    state = {
        showColorsEditor: false,
        colors: this.props.colors,
    };

    componentDidMount() {
        document.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeyDown);
    }

    onKeyDown = (event) => {
        if (event.keyCode === 86 && event.metaKey && event.altKey) {
            // command + option + V
            this.setState({showColorsEditor: !this.state.showColorsEditor});

            return;
        }

        if (event.keyCode === 27 && this.state.showColorsEditor) {
            // Esc
            this.setState({showColorsEditor: false});

            return;
        }
    };

    applyColorScheme = debounce(() => {
        Highcharts.setOptions({colors: this.state.colors});
        Highcharts.charts.forEach((chart) => chart && chart.update({colors: this.state.colors}));
    }, 500);

    onModalClose = () => {
        this.setState({showColorsEditor: false});
    };

    onColorChange = (color, index) => {
        const newColors = [
            ...this.state.colors.slice(0, index),
            color,
            ...this.state.colors.slice(index + 1),
        ];

        this.setState({colors: newColors}, this.applyColorScheme);
    };

    saveFile = () => {
        const a = document.createElement('a');
        const json = JSON.stringify({colors: this.state.colors});
        a.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(json)}`);
        a.setAttribute('download', `color_palette_${moment().format('YYYY-MM-DD_HH:mm')}.json`);
        a.click();
    };

    loadFile = (event) => {
        if (typeof window.FileReader !== 'function') {
            alert(
                'Your browser does not support the FileReader API, it is not possible to read the file.',
            );
        }

        const input = event.target;

        if (!input.files[0]) {
            return undefined;
        }

        const file = input.files[0];
        const fileReader = new FileReader();

        fileReader.onload = (onloadEvent) => {
            this.setState(
                {colors: JSON.parse(onloadEvent.target.result).colors},
                this.applyColorScheme,
            );
        };

        fileReader.readAsText(file);
    };

    render() {
        const {colors} = this.state;

        return (
            this.state.showColorsEditor && (
                <DndProvider backend={HTML5Backend}>
                    <DraggablePaletteSettings
                        draggableModalTitle={i18n('chartkit', 'label-palette-editor')}
                        draggableModalCloseHandler={this.onModalClose}
                        colors={colors}
                        onColorChange={this.onColorChange}
                        loadFile={this.loadFile}
                        saveFile={this.saveFile}
                    />
                </DndProvider>
            )
        );
    }
}
