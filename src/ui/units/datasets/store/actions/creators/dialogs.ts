import type {DatasetField} from 'shared';
import {openDialogParameter} from 'ui/store/actions/dialog';

import type {DatasetTab} from '../../../constants';

import {
    addFieldWithValidation,
    updateFieldWithValidation,
    updateFieldWithValidationByMultipleUpdates,
} from './datasetTyped';
import type {DatasetDispatch} from './datasetTyped';

export function openDialogParameterCreate(
    args: {tab?: DatasetTab; showTemplateWarn?: boolean} = {},
) {
    return (dispatch: DatasetDispatch) => {
        const {tab, showTemplateWarn} = args;
        dispatch(
            openDialogParameter({
                type: 'create',
                onApply: (field) => dispatch(addFieldWithValidation(field, {tab})),
                showTemplateWarn,
            }),
        );
    };
}

export function openDialogParameterEdit(args: {field: DatasetField; tab?: DatasetTab}) {
    return (dispatch: DatasetDispatch) => {
        const {field, tab} = args;
        dispatch(
            openDialogParameter({
                type: 'edit',
                field,
                onApply: (updatedField) => {
                    if (updatedField.guid === field.guid) {
                        dispatch(updateFieldWithValidation(updatedField, {tab}));
                    } else {
                        // We send two field updates. Since title === is the guid for the parameter, you need to update both title and guid at the same time.
                        // Beck does not know how to do this, so we send 2 updates. First we update the guid, and with the second update we update the rest of the entire field.
                        const fieldWithNewGuid = {
                            ...updatedField,
                            guid: field.guid,
                            new_id: updatedField.guid,
                        };
                        dispatch(
                            updateFieldWithValidationByMultipleUpdates(
                                [fieldWithNewGuid, updatedField],
                                {tab},
                            ),
                        );
                    }
                },
            }),
        );
    };
}
