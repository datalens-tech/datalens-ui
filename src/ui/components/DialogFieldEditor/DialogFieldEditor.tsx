import React from 'react';

import type {Dataset, DatasetField, DatasetOptions, WorkbookId} from 'shared';

import type {DataTypeConfig} from '../../typings/common';
import DialogManager from '../DialogManager/DialogManager';
import FieldEditor from '../FieldEditor';

import './DialogFieldEditor.scss';

export type DialogFieldEditorProps<T = DatasetField> = {
    datasetContent: Dataset['dataset'] | undefined;
    datasetId: string;
    workbookId: WorkbookId;
    datasetOptions: DatasetOptions | undefined;
    field?: T;
    fields: T[];
    onlyFormulaEditor: boolean;
    dataTypes?: DataTypeConfig[];

    onClose: () => void;
    onSave: (field: T) => void;
    onCreate: (field: T) => void;
    onLoadStart?: () => void;
    onLoadComplete?: () => void;
};

export type OpenDialogFieldEditorArgs<T = unknown> = {
    id: typeof DIALOG_FIELD_EDITOR;
    props: DialogFieldEditorProps<T>;
};

export const DIALOG_FIELD_EDITOR = Symbol('DIALOG_FIELD_EDITOR');

export const DialogFieldEditor: React.FC<DialogFieldEditorProps> = (
    props: DialogFieldEditorProps,
) => {
    const {
        datasetContent,
        datasetId,
        workbookId,
        datasetOptions,
        field,
        fields,
        dataTypes,
        onlyFormulaEditor,
        onClose,
        onSave,
        onCreate,
        onLoadStart,
        onLoadComplete,
    } = props;

    return (
        <FieldEditor
            datasetId={datasetId}
            workbookId={workbookId}
            dataset={datasetContent}
            field={field}
            fields={fields}
            sources={datasetContent?.sources || []}
            sourceAvatars={datasetContent?.source_avatars || []}
            dataTypes={dataTypes}
            options={datasetOptions}
            onClose={onClose}
            onSave={onSave}
            onCreate={onCreate}
            onLoadStart={onLoadStart}
            onLoadComplete={onLoadComplete}
            onlyFormulaEditor={onlyFormulaEditor}
        />
    );
};

DialogManager.registerDialog(DIALOG_FIELD_EDITOR, DialogFieldEditor);
