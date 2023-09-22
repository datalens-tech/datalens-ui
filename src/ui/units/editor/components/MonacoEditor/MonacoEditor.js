import React from 'react';

import {withThemeValue} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {mapUIKitThemeToMonacoTheme} from 'libs/monaco';
import noop from 'lodash/noop';
import PropTypes from 'prop-types';

import logger from '../../../../libs/logger';
import {loadMonaco} from '../../../../libs/monaco';
import {Status} from '../../constants/common';
import modelSyncManager from '../../libs/monaco/modelSyncManager';
import {ViewError} from '../ViewError/ViewError';
import {ViewLoader} from '../ViewLoader/ViewLoader';

import './MonacoEditor.scss';

const i18n = I18n.keyset('component.monaco.view');

class MonacoEditor extends React.Component {
    constructor(props) {
        super(props);
        this.__current_value = props.value;
        this.monakoContainerRef = React.createRef();
        this.state = {
            status: Status.Loading,
        };
    }

    componentDidMount() {
        this.init();
    }

    componentDidUpdate(prevProps) {
        if (!this.monaco) {
            return;
        }
        if (this.props.value !== this.__current_value) {
            // Always refer to the latest value
            this.__current_value = this.props.value;
            // Consider the situation of rendering 1+ times before the editor mounted
            if (
                this.editor &&
                (this.__focused ||
                    !modelSyncManager.someEditorSyncValue({
                        id: this.props.id,
                        value: this.props.value,
                    }))
            ) {
                this.__prevent_trigger_change_event = true;
                this.editor.setValue(this.__current_value);
                modelSyncManager.saveViewState({
                    id: this.props.id,
                    viewState: this.editor.saveViewState(),
                });
                this.__prevent_trigger_change_event = false;
            }
        }
        if (prevProps.language !== this.props.language) {
            this.monaco.editor.setModelLanguage(this.editor.getModel(), this.props.language);
        }
        if (prevProps.themeValue !== this.props.themeValue) {
            this.monaco.editor.setTheme(mapUIKitThemeToMonacoTheme(this.props.themeValue));
        }
        if (prevProps.options !== this.props.options) {
            this.editor.updateOptions(this.props.options);
        }
        if (this.editor && this.props.size !== prevProps.size) {
            this.editor.layout();
        }
    }

    componentWillUnmount() {
        this._isUnmounted = true;
        if (!this.monaco) {
            return;
        }
        this.destroyMonaco();
    }

    destroyMonaco() {
        const {id} = this.props;
        modelSyncManager.destroyEditor({id, editor: this.editor});
    }

    async init() {
        try {
            this.setState({status: Status.Loading});
            this.monaco = await loadMonaco();
            if (this._isUnmounted) {
                return;
            }
            this.setState({status: Status.Success}, () => {
                this.initMonaco();
            });
        } catch (error) {
            logger.logError('MonacoEditor: loadMonaco failed', error);
            if (this._isUnmounted) {
                return;
            }
            this.setState({status: Status.Failed});
        }
    }

    initMonaco() {
        const {language, value, options, id, themeValue} = this.props;
        if (this.monakoContainerRef.current) {
            const {model, viewState} = modelSyncManager.createModel({
                monaco: this.monaco,
                id,
                value,
                language,
            });
            this.editor = this.monaco.editor.create(this.monakoContainerRef.current, {
                model,
                language,
                ...options,
            });
            if (themeValue) {
                this.monaco.editor.setTheme(mapUIKitThemeToMonacoTheme(themeValue));
            }
            if (viewState) {
                this.editor.restoreViewState(viewState);
            }
            const editorValue = this.editor.getValue();
            if (editorValue !== value) {
                this.editor.setValue(value);
                modelSyncManager.saveViewState({
                    id: this.props.id,
                    viewState: this.editor.saveViewState(),
                });
            }
            modelSyncManager.saveEditor({id, editor: this.editor});
            // After initializing monaco editor
            this.editorDidMount(this.editor);
        }
    }

    editorDidMount(editor) {
        this.props.editorDidMount(editor, this.monaco);
        editor.onDidChangeModelContent((event) => {
            const value = editor.getValue();
            // Always refer to the latest value
            this.__current_value = value;
            // Only invoking when user input changed
            if (!this.__prevent_trigger_change_event && this.__focused) {
                modelSyncManager.saveViewState({
                    id: this.props.id,
                    viewState: this.editor.saveViewState(),
                });
                this.props.onChange(value, event);
            }
        });
        editor.onDidFocusEditorWidget(() => {
            this.__focused = true;
            this.props.onFocus(editor, this.monaco);
        });
        editor.onDidBlurEditorWidget(() => {
            this.__focused = false;
            this.props.onBlur(editor, this.monaco);
        });
    }

    render() {
        const {status} = this.state;
        return (
            <div ref={this.monakoContainerRef} className="react-monaco-editor-container">
                {status === Status.Loading && <ViewLoader />}
                {status === Status.Failed && (
                    <ViewError withButton={false} errorText={i18n('label_failed-to-load')} />
                )}
            </div>
        );
    }
}

MonacoEditor.propTypes = {
    id: PropTypes.string.isRequired, // id bind with Model
    value: PropTypes.string.isRequired,
    language: PropTypes.string,
    options: PropTypes.object,
    editorDidMount: PropTypes.func,
    onChange: PropTypes.func,
    themeValue: PropTypes.string,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    size: PropTypes.number,
};

MonacoEditor.defaultProps = {
    language: 'javascript',
    options: {},
    editorDidMount: noop,
    onChange: noop,
    onFocus: noop,
    onBlur: noop,
};

function MonacoEditorWrap(props) {
    return <MonacoEditor key={props.id + props.language} {...props} />;
}

MonacoEditorWrap.propTypes = {
    id: PropTypes.string.isRequired,
    language: PropTypes.string,
};

export default withThemeValue(MonacoEditorWrap);
