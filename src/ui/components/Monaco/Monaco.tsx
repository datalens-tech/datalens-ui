import React from 'react';

import {withTheme, withThemeValue} from '@gravity-ui/uikit';
import type {RealTheme, Theme} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import type {MonacoTypes} from '../../libs/monaco';
import {mapUIKitThemeToDlMonacoTheme, mapUIKitThemeToMonacoTheme} from '../../libs/monaco';

import type {MonacoEditorProps} from './LazyMonaco';
import {LazyMonacoEditor} from './LazyMonaco';

import './Monaco.scss';

const b = block('dl-monaco-editor');

export interface MonacoProps {
    onChange: (code: string) => void;
    language: string;
    theme: Theme;
    themeValue: RealTheme;
    value?: string;
    className?: string;
    width?: number;
    height?: number;
    options?: MonacoEditorProps['options'];
    editorWillMount?: MonacoEditorProps['editorWillMount'];
    editorDidMount?: MonacoEditorProps['editorDidMount'];
    useDatalensTheme?: boolean;
}

const defaultOptions: MonacoEditorProps['options'] = {
    fontSize: 13,
    matchBrackets: 'never',
    minimap: {
        enabled: false,
    },
    renderLineHighlightOnlyWhenFocus: true, // CHARTS-5357
    overviewRulerBorder: false, // CHARTS-5357
};

class Monaco extends React.Component<MonacoProps> {
    editor: MonacoTypes.editor.IStandaloneCodeEditor | null = null;

    componentDidMount() {
        window.addEventListener('resize', this.onResizeWindow);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onResizeWindow);
    }

    render() {
        const {className, language, width, height, value, onChange, editorWillMount} = this.props;

        return (
            <div className={b(null, className)} style={{width, height}}>
                <LazyMonacoEditor
                    width={width}
                    height={height}
                    language={language}
                    value={value}
                    theme={this.theme}
                    options={this.options}
                    editorWillMount={editorWillMount}
                    editorDidMount={this.onEditorDidMount}
                    onChange={onChange}
                />
            </div>
        );
    }

    get theme() {
        const {themeValue, useDatalensTheme} = this.props;

        return useDatalensTheme
            ? mapUIKitThemeToDlMonacoTheme(themeValue)
            : mapUIKitThemeToMonacoTheme(themeValue);
    }

    get options(): MonacoEditorProps['options'] {
        const {options} = this.props;

        if (options) {
            return {
                ...defaultOptions,
                ...options,
            };
        }

        return defaultOptions;
    }

    onEditorDidMount: MonacoEditorProps['editorDidMount'] = (editor, monaco) => {
        this.editor = editor;
        if (typeof this.props.editorDidMount === 'function') {
            this.props.editorDidMount(editor, monaco);
        }
    };

    /*  
    You can use the automaticLayout flag for the resize, but when it is set to true
    an event with an interval of 100ms is set on the window, which checks the state of the viewport.
    It seems that it is too expensive for such an operation, so the resize is custom
    */

    onResizeWindow = () => {
        if (this.editor) {
            this.editor.layout();
        }
    };
}

export default withTheme(withThemeValue(Monaco));
