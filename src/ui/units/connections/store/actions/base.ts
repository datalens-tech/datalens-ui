import clone from 'lodash/clone';
import get from 'lodash/get';

import {FieldKey} from '../../constants';
import type {
    ConnectionsReduxDispatch,
    GetState,
    HandleReplacedSourcesArgs,
    ReplaceSource,
    ResetFormsData,
    ResetS3BasedData,
    SetBeingDeletedSourceId,
    SetCachedHtmlItem,
    SetCheckData,
    SetCheckLoading,
    SetConectorData,
    SetConnectionKey,
    SetEntry,
    SetFileColumnFilter,
    SetFileReplaceSources,
    SetFileSelectedItemId,
    SetFileSources,
    SetFlattenConnectors,
    SetForm,
    SetFormSchema,
    SetGSheetActiveDialog,
    SetGSheetColumnFilter,
    SetGSheetItems,
    SetGSheetSelectedItemId,
    SetGroupedConnectors,
    SetGsheetAddSectionState,
    SetInitialForm,
    SetInitialState,
    SetInnerForm,
    SetPageLoading,
    SetReplaceSourceActionData,
    SetSchemaLoading,
    SetSubmitLoading,
    SetUploadedFiles,
    SetValidationErrors,
    SetYadocsActiveDialog,
    SetYadocsColumnFilter,
    SetYadocsItems,
    SetYadocsSelectedItemId,
} from '../typings';

import {getFilteredReplaceSources} from './gsheet/utils';

export const SET_GROUPED_CONNECTORS = Symbol('connections/SET_GROUPED_CONNECTORS');
export const SET_FLATTEN_CONNECTORS = Symbol('connections/SET_FLATTEN_CONNECTORS');
export const SET_ENTRY = Symbol('connections/SET_ENTRY');
export const SET_CONNECTION_KEY = Symbol('connections/SET_CONNECTION_KEY');
export const SET_CONNECTOR_DATA = Symbol('connections/SET_CONNECTOR_DATA');
export const SET_PAGE_LOADING = Symbol('connections/SET_PAGE_LOADING');
export const SET_FORM = Symbol('connections/SET_FORM');
export const SET_INITIAL_FORM = Symbol('connections/SET_INITIAL_FORM');
export const SET_INNER_FORM = Symbol('connections/SET_INNER_FORM');
export const SET_CACHED_HTML_ITEM = Symbol('connections/SET_CACHED_HTML_ITEM');
export const SET_SCHEMA = Symbol('connections/SET_SCHEMA');
export const SET_VALIDATION_ERRORS = Symbol('connections/SET_VALIDATION_ERRORS');
export const SET_INITIAL_STATE = Symbol('connections/SET_INITIAL_STATE');
export const SET_CHECK_LOADING = Symbol('connections/SET_CHECK_LOADING');
export const SET_CHECK_DATA = Symbol('connections/SET_CHECK_DATA');
export const SET_SUBMIT_LOADING = Symbol('connections/SET_SUBMIT_LOADING');
export const SET_SCHEMA_LOADING = Symbol('connections/SET_SCHEMA_LOADING');
export const RESET_FORMS_DATA = Symbol('connections/RESET_FORMS_DATA');
export const SET_UPLOADED_FILES = Symbol('connections/SET_UPLOADED_FILES');
export const SET_FILE_SOURCES = Symbol('connections/SET_FILE_SOURCES');
export const SET_FILE_SELECTED_ITEM_ID = Symbol('connections/SET_FILE_SELECTED_ITEM_ID');
export const SET_FILE_COLUMN_FILTER = Symbol('connections/SET_FILE_COLUMN_FILTER');
export const SET_BEING_DELETED_SOURCE_ID = Symbol('connections/SET_BEING_DELETED_SOURCE_ID');
export const SET_FILE_REPLACE_SOURCES = Symbol('connections/SET_FILE_REPLACE_SOURCES');
export const SET_REPLACE_SOURCE_ACTION_DATA = Symbol('connections/SET_REPLACE_SOURCE_ACTION_DATA');
export const RESET_S3_BASED_DATA = Symbol('connections/RESET_S3_BASED_DATA');
export const SET_GSHEET_ADD_SECTION_STATE = Symbol('connections/SET_GSHEET_ADD_SECTION_STATE');
export const SET_GSHEET_SELECTED_ITEM_ID = Symbol('connections/SET_GSHEET_SELECTED_ITEM_ID');
export const SET_GSHEET_COLUMN_FILTER = Symbol('connections/SET_GSHEET_COLUMN_FILTER');
export const SET_GSHEET_ITEMS = Symbol('connections/SET_GSHEET_ITEMS');
export const SET_GSHEET_ACTIVE_DIALOG = Symbol('connections/SET_GSHEET_ACTIVE_DIALOG');
export const SET_YADOCS_SELECTED_ITEM_ID = Symbol('connections/SET_YADOCS_SELECTED_ITEM_ID');
export const SET_YADOCS_ITEMS = Symbol('connections/SET_YADOCS_ITEMS');
export const SET_YADOCS_ACTIVE_DIALOG = Symbol('connections/SET_YADOCS_ACTIVE_DIALOG');
export const SET_YADOCS_COLUMN_FILTER = Symbol('connections/SET_YADOCS_COLUMN_FILTER');

export function setEntry(payload: SetEntry['payload']): SetEntry {
    return {type: SET_ENTRY, payload};
}

export function setConnectionKey(key: SetConnectionKey['payload']): SetConnectionKey {
    return {type: SET_CONNECTION_KEY, payload: key};
}

export function setGroupedConnectors(
    payload: SetGroupedConnectors['payload'],
): SetGroupedConnectors {
    return {
        type: SET_GROUPED_CONNECTORS,
        payload,
    };
}

export function setFlattenConnectors(
    payload: SetFlattenConnectors['payload'],
): SetFlattenConnectors {
    return {
        type: SET_FLATTEN_CONNECTORS,
        payload,
    };
}

export function setConectorData(payload: SetConectorData['payload']): SetConectorData {
    return {
        type: SET_CONNECTOR_DATA,
        payload,
    };
}

export function setForm(payload: SetForm['payload']): SetForm {
    return {
        type: SET_FORM,
        payload,
    };
}

export function setInitialForm(payload: SetInitialForm['payload']): SetInitialForm {
    return {
        type: SET_INITIAL_FORM,
        payload,
    };
}

export function setInnerForm(payload: SetInnerForm['payload']): SetInnerForm {
    return {
        type: SET_INNER_FORM,
        payload,
    };
}

export function setPageLoading(payload: SetPageLoading['payload']): SetPageLoading {
    return {
        type: SET_PAGE_LOADING,
        payload,
    };
}

export function setCachedHtmlItem(payload: SetCachedHtmlItem['payload']): SetCachedHtmlItem {
    return {
        type: SET_CACHED_HTML_ITEM,
        payload,
    };
}

export function setSchema(payload: SetFormSchema['payload']): SetFormSchema {
    return {
        type: SET_SCHEMA,
        payload,
    };
}

export function setValidationErrors(payload: SetValidationErrors['payload']): SetValidationErrors {
    return {
        type: SET_VALIDATION_ERRORS,
        payload,
    };
}

export function setInitialState(): SetInitialState {
    return {
        type: SET_INITIAL_STATE,
    };
}

export function setCheckLoading(payload: SetCheckLoading['payload']): SetCheckLoading {
    return {
        type: SET_CHECK_LOADING,
        payload,
    };
}

export function setCheckData(payload: SetCheckData['payload']): SetCheckData {
    return {
        type: SET_CHECK_DATA,
        payload,
    };
}

export function setSubmitLoading(payload: SetSubmitLoading['payload']): SetSubmitLoading {
    return {
        type: SET_SUBMIT_LOADING,
        payload,
    };
}

export function setSchemaLoading(payload: SetSchemaLoading['payload']): SetSchemaLoading {
    return {
        type: SET_SCHEMA_LOADING,
        payload,
    };
}

export function resetFormsData(): ResetFormsData {
    return {
        type: RESET_FORMS_DATA,
    };
}

export function setUploadedFiles(payload: SetUploadedFiles['payload']): SetUploadedFiles {
    return {
        type: SET_UPLOADED_FILES,
        payload,
    };
}

export function setFileSources(payload: SetFileSources['payload']): SetFileSources {
    return {
        type: SET_FILE_SOURCES,
        payload,
    };
}

export function setFileSelectedItemId(
    payload: SetFileSelectedItemId['payload'],
): SetFileSelectedItemId {
    return {
        type: SET_FILE_SELECTED_ITEM_ID,
        payload,
    };
}

export function setFileColumnFilter(payload: SetFileColumnFilter['payload']): SetFileColumnFilter {
    return {
        type: SET_FILE_COLUMN_FILTER,
        payload,
    };
}

export function setBeingDeletedSourceId(
    payload: SetBeingDeletedSourceId['payload'],
): SetBeingDeletedSourceId {
    return {
        type: SET_BEING_DELETED_SOURCE_ID,
        payload,
    };
}

export function setFileReplaceSources(
    payload: SetFileReplaceSources['payload'],
): SetFileReplaceSources {
    return {
        type: SET_FILE_REPLACE_SOURCES,
        payload,
    };
}

export function setReplaceSourceActionData(
    payload: SetReplaceSourceActionData['payload'],
): SetReplaceSourceActionData {
    return {
        type: SET_REPLACE_SOURCE_ACTION_DATA,
        payload,
    };
}

export function resetS3BasedData(): ResetS3BasedData {
    return {
        type: RESET_S3_BASED_DATA,
    };
}

export function setGsheetAddSectionState(
    payload: SetGsheetAddSectionState['payload'],
): SetGsheetAddSectionState {
    return {
        type: SET_GSHEET_ADD_SECTION_STATE,
        payload,
    };
}

export function setGSheetSelectedItemId(
    payload: SetGSheetSelectedItemId['payload'],
): SetGSheetSelectedItemId {
    return {
        type: SET_GSHEET_SELECTED_ITEM_ID,
        payload,
    };
}

export function setGSheetColumnFilter(
    payload: SetGSheetColumnFilter['payload'],
): SetGSheetColumnFilter {
    return {
        type: SET_GSHEET_COLUMN_FILTER,
        payload,
    };
}

export function setGSheetItems(payload: SetGSheetItems['payload']): SetGSheetItems {
    return {
        type: SET_GSHEET_ITEMS,
        payload,
    };
}

export function setGSheetActiveDialog(
    payload: SetGSheetActiveDialog['payload'],
): SetGSheetActiveDialog {
    return {
        type: SET_GSHEET_ACTIVE_DIALOG,
        payload,
    };
}

export function setYadocsItems(payload: SetYadocsItems['payload']): SetYadocsItems {
    return {
        type: SET_YADOCS_ITEMS,
        payload,
    };
}

export function setYadocsSelectedItemId(
    payload: SetYadocsSelectedItemId['payload'],
): SetYadocsSelectedItemId {
    return {
        type: SET_YADOCS_SELECTED_ITEM_ID,
        payload,
    };
}

export function setYadocsActiveDialog(
    payload: SetYadocsActiveDialog['payload'],
): SetYadocsActiveDialog {
    return {
        type: SET_YADOCS_ACTIVE_DIALOG,
        payload,
    };
}

export function setYadocsColumnFilter(
    payload: SetYadocsColumnFilter['payload'],
): SetYadocsColumnFilter {
    return {
        type: SET_YADOCS_COLUMN_FILTER,
        payload,
    };
}

export const handleReplacedSources = (args: HandleReplacedSourcesArgs) => {
    return (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const replaceSources = get(
            getState().connections,
            ['form', FieldKey.ReplaceSources],
            [],
        ) as ReplaceSource[];
        let nextReplaceSources: ReplaceSource[] | undefined;

        switch (args.action) {
            case 'add': {
                const replaceSource = args.replaceSource;
                nextReplaceSources = [...replaceSources];
                const existedReplaceSourceIndex = replaceSources.findIndex(({new_source_id}) => {
                    return new_source_id === replaceSource.old_source_id;
                });

                if (existedReplaceSourceIndex === -1) {
                    nextReplaceSources.push(replaceSource);
                } else {
                    const updatedReplaceSource = clone(replaceSources[existedReplaceSourceIndex]);
                    updatedReplaceSource.new_source_id = replaceSource.new_source_id;
                    nextReplaceSources.splice(existedReplaceSourceIndex, 1, updatedReplaceSource);
                }

                break;
            }
            case 'filter': {
                const {filteredSources, filtered} = getFilteredReplaceSources(
                    replaceSources,
                    args.replacedSourceId,
                );

                if (filtered) {
                    nextReplaceSources = [...filteredSources];
                }
            }
        }

        if (nextReplaceSources) {
            dispatch(setForm({updates: {[FieldKey.ReplaceSources]: nextReplaceSources}}));
        }
    };
};
