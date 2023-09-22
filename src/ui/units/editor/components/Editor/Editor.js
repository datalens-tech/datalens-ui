import React, {useEffect, useRef} from 'react';

import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {useSetState} from 'ui';

import {getEditorDefaultOptions} from '../../libs/monaco/options';
import {MonacoUtils} from '../../libs/monaco/utils';
import MonacoEditor from '../MonacoEditor/MonacoEditor';

const options = getEditorDefaultOptions();

const Editor = ({id, language, value, onChangeEditor, onModuleClick, highlightRange, size}) => {
    const disposeTypesRef = useRef(null);
    const [state, setState] = useSetState({
        editor: null,
        monaco: null,
        decorations: [],
    });
    const revId = useSelector((state) => state.editor?.entry?.revId);

    useEffect(() => {
        let decorations = state.decorations;
        if (state.editor) {
            const range = highlightRange && id === highlightRange.id ? highlightRange.range : null;
            decorations = MonacoUtils.highlighRange(
                state.editor,
                state.monaco,
                range,
                state.decorations,
            );
        }
        setState({decorations});
    }, [highlightRange, id, state.editor]);

    const onChange = (newValue) => {
        onChangeEditor({value: newValue, scriptId: id});
    };

    const getRevId = React.useCallback(() => revId, [revId]);

    function editorDidMount(editor, monaco) {
        MonacoUtils.setDefaults(monaco);
        MonacoUtils.addModuleClickAction(editor, onModuleClick);
        MonacoUtils.addKeybinds(editor, monaco);
        MonacoUtils.highlightLines(editor, monaco, id);
        MonacoUtils.addActionMakeTabUrl(editor, monaco, id, getRevId);
        setState({editor, monaco});
    }

    function onFocus(editor, monaco) {
        if (disposeTypesRef.current) {
            disposeTypesRef.current.dispose();
        }
        disposeTypesRef.current = MonacoUtils.addTypes(editor, monaco, id, language);
    }

    function onBlur() {
        if (disposeTypesRef.current) {
            disposeTypesRef.current.dispose();
        }
        disposeTypesRef.current = null;
    }

    return (
        <MonacoEditor
            id={id}
            language={language}
            value={value}
            options={options}
            onChange={onChange}
            editorDidMount={editorDidMount}
            onFocus={onFocus}
            onBlur={onBlur}
            size={size}
        />
    );
};

Editor.propTypes = {
    id: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChangeEditor: PropTypes.func.isRequired,
    onModuleClick: PropTypes.func.isRequired,
    highlightRange: PropTypes.shape({
        range: PropTypes.array,
        id: PropTypes.string,
    }),
    size: PropTypes.number,
};

export default React.memo(Editor);
