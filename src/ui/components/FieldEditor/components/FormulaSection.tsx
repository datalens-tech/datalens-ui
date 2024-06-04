import React from 'react';

import block from 'bem-cn-lite';
import SplitPane from 'react-split-pane';

import type {DatasetField, DatasetFieldError} from '../../../../shared';
import {FORMULA_LANGUAGE_ID, SPLIT_PANE_RESIZER_CLASSNAME} from '../../../constants';
import type {MonacoTypes} from '../../../libs/monaco';
import {setDatalensFormulaLanguageConfiguration} from '../../../libs/monaco';
import DatasetFieldList from '../../DatasetFieldList/DatasetFieldList';
import type {MonacoProps} from '../../Monaco/Monaco';
import Monaco from '../../Monaco/Monaco';
import {LEFT_PANE_MAX_WIDTH, LEFT_PANE_MIN_WIDTH, RESIZER_WIDTH} from '../constants';
import type {Cancelable, ModifyField} from '../typings';

export interface FormulaSectionProps {
    modifyField: ModifyField;
    setEditorInstance: (editor: MonacoTypes.editor.IStandaloneCodeEditor | null) => void;
    setMonaco: (monaco: typeof MonacoTypes | null) => void;
    onSplitPaneChange: Cancelable;
    field: DatasetField;
    fields: DatasetField[];
    fieldErrors: DatasetFieldError[];
    supportedFunctions: string[];
}

const b = block('dl-field-editor');

const getCalculatedWidht = (width: number) => {
    return `calc(100% - ${width}px)`;
};

class FormulaSection extends React.Component<FormulaSectionProps> {
    editor: MonacoTypes.editor.IStandaloneCodeEditor | null = null;
    monaco: typeof MonacoTypes | null = null;
    decorations: string[] = [];

    componentDidMount() {
        document.addEventListener('keydown', this.escapePressHandler);
    }

    componentDidUpdate(prevProps: FormulaSectionProps) {
        const {fields, fieldErrors, supportedFunctions} = this.props;

        // Set new rules for coloring and autocomplete when changing the set of fields
        if (this.monaco && prevProps.fields !== fields) {
            setDatalensFormulaLanguageConfiguration(
                this.monaco,
                supportedFunctions,
                fields.map(({title}) => title),
            );
        }

        if (prevProps.fieldErrors !== fieldErrors) {
            this.handleErrorState();
        }
    }

    componentWillUnmount() {
        this.props.setEditorInstance(null);
        document.removeEventListener('keydown', this.escapePressHandler);
    }

    render() {
        const {
            fields,
            field: {formula},
            modifyField,
            onSplitPaneChange,
            children,
        } = this.props;

        return (
            <SplitPane
                resizerClassName={SPLIT_PANE_RESIZER_CLASSNAME}
                split={'vertical'}
                primary={'second'}
                defaultSize={getCalculatedWidht(LEFT_PANE_MIN_WIDTH + RESIZER_WIDTH)}
                style={{overflow: 'initial'}}
                pane1Style={{
                    minWidth: LEFT_PANE_MIN_WIDTH,
                    maxWidth: LEFT_PANE_MAX_WIDTH,
                }}
                pane2Style={{
                    minWidth: getCalculatedWidht(LEFT_PANE_MAX_WIDTH),
                    maxWidth: getCalculatedWidht(LEFT_PANE_MIN_WIDTH + RESIZER_WIDTH),
                }}
                onChange={onSplitPaneChange}
            >
                <div className={b('formula-fields')}>
                    <DatasetFieldList
                        fields={fields}
                        itemHeight={32}
                        onFiledItemClick={this.onDatasetItemClick}
                    />
                </div>
                <div className={b('formula-editor-wrap')}>
                    <Monaco
                        editorWillMount={this.editorWillMount}
                        editorDidMount={this.editorDidMount}
                        className={b('formula-editor')}
                        language={FORMULA_LANGUAGE_ID}
                        value={formula}
                        options={{
                            glyphMargin: true,
                            hideCursorInOverviewRuler: true,
                        }}
                        onChange={(newFormula) => modifyField({formula: newFormula})}
                        useDatalensTheme
                    />
                    {children}
                </div>
            </SplitPane>
        );
    }

    editorWillMount: MonacoProps['editorWillMount'] = (monaco) => {
        this.monaco = monaco;
        this.props.setMonaco(monaco);
        const {fields, supportedFunctions} = this.props;

        if (this.monaco) {
            setDatalensFormulaLanguageConfiguration(
                this.monaco,
                supportedFunctions,
                fields.map(({title}) => title),
            );
        }
    };

    editorDidMount: MonacoProps['editorDidMount'] = (editor) => {
        this.editor = editor;
        this.props.setEditorInstance(editor);

        if (this.editor) {
            this.editor.focus();
        }
    };

    getError() {
        const {fieldErrors} = this.props;

        if (!fieldErrors.length) {
            return {column: 1, row: 1, message: ''};
        }

        // Backend returns only single error
        const {column, row, message} = fieldErrors[0].errors[0];

        return {
            message: message || '',
            // Backend counts rows and columns starting from 0, monaco use 1 as start index
            column: column ? column + 1 : 1,
            row: row ? row + 1 : 1,
        };
    }

    hideGlyph() {
        const model = this.editor?.getModel();

        if (!model) {
            return;
        }

        model.deltaDecorations([this.decorations[0]], []);
    }

    showGlyph() {
        const model = this.editor?.getModel();
        const {row, message} = this.getError();

        if (!model) {
            return;
        }

        /**
         * Before drawing the new icon remove the old one,
         * otherwise they will accumulate messages displayed by hover on alert icon
         */
        this.hideGlyph();

        this.decorations = model.deltaDecorations(
            [],
            [
                {
                    range: {
                        startLineNumber: row,
                        startColumn: 1,
                        endLineNumber: row,
                        endColumn: 1,
                    },
                    options: {
                        glyphMarginClassName: b('formula-editor-glyph'),
                        glyphMarginHoverMessage: {value: message},
                    },
                },
            ],
        );
    }

    setErrorMarker(marker?: MonacoTypes.editor.IMarkerData) {
        const model = this.editor?.getModel();

        if (!model) {
            return;
        }

        const markers: MonacoTypes.editor.IMarkerData[] = [];

        if (marker) {
            markers.push(marker);
        }

        if (this.monaco) {
            this.monaco.editor.setModelMarkers(model, 'owner', markers);
        }
    }

    handleErrorState() {
        const {fieldErrors} = this.props;
        const {column, row, message} = this.getError();
        const model = this.editor?.getModel();

        if (!model) {
            return;
        }

        if (!fieldErrors.length) {
            this.hideGlyph();
            this.setErrorMarker();

            return;
        }

        this.showGlyph();

        if (this.monaco) {
            this.setErrorMarker({
                message,
                startLineNumber: row,
                startColumn: column,
                endLineNumber: row,
                endColumn: column,
                severity: this.monaco.MarkerSeverity.Error,
            });
        }
    }

    /*
     * Intercept the push of esc in monaco to prevent the closing of dialog.
     * You can use native editor.onKeyDown, but in this case if you stop event bubbling
     * all events in editor will be canceled.
     */
    escapePressHandler = (e: KeyboardEvent) => {
        const isEscapePressed = e.key === 'Escape';
        const isEditorFocused = this.editor?.hasTextFocus();

        if (isEscapePressed && isEditorFocused) {
            e.stopPropagation();
        }
    };

    pasteTextOverSelection = (selection: MonacoTypes.Selection, text: string) => {
        if (!this.editor || !this.monaco) {
            return;
        }

        const {startLineNumber, startColumn, endLineNumber, endColumn} = selection;
        const hasOpeningSquareBracket =
            this.editor.getModel()?.getValueInRange({
                startLineNumber,
                startColumn: startColumn - 1,
                endLineNumber,
                endColumn: startColumn,
            }) === '[';

        this.editor?.executeEdits('source', [
            {
                range: new this.monaco.Range(
                    startLineNumber,
                    startColumn,
                    endLineNumber,
                    endColumn,
                ),
                text: hasOpeningSquareBracket ? text : `[${text}]`,
                forceMoveMarkers: true,
            },
        ]);
    };

    onDatasetItemClick = async ({title}: DatasetField) => {
        if (!this.editor) {
            return;
        }

        this.editor.focus();

        const selections = this.editor.getSelections() || [];

        selections.forEach((selection) => this.pasteTextOverSelection(selection, title));
    };
}

export default FormulaSection;
