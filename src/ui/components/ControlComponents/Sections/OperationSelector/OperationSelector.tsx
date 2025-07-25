import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {HelpMark} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {Operations} from 'shared';
import {getDefaultTitleForOperation} from 'shared';
import {SelectFeatured} from 'ui/components/Select/wrappers/SelectFeatured';
import {setSelectorDialogItem} from 'ui/store/actions/controlDialog';
import {
    selectInputOperations,
    selectIsControlConfigurationDisabled,
    selectSelectorDialog,
} from 'ui/store/selectors/controlDialog';

const i18n = I18n.keyset('dash.control-dialog.edit');

const OperationSelector = ({className}: {className?: string}) => {
    const dispatch = useDispatch();
    const {operation} = useSelector(selectSelectorDialog);
    const operations = useSelector(selectInputOperations);
    const isFieldDisabled = useSelector(selectIsControlConfigurationDisabled);

    React.useEffect(() => {
        const currentOperationNotSupported =
            operations &&
            operation &&
            operations.every((item: {value: Operations}) => item.value !== operation);

        if (currentOperationNotSupported) {
            dispatch(
                setSelectorDialogItem({
                    operation: undefined,
                }),
            );
        }
    }, [operations, operation, dispatch]);

    const handleOperationUpdate = React.useCallback(
        ([value]) => {
            const newTitle = value ? getDefaultTitleForOperation(value) : undefined;

            dispatch(
                setSelectorDialogItem({
                    operation: value,
                    innerTitle: newTitle,
                }),
            );
        },
        [dispatch],
    );

    const options = React.useMemo(
        () => operations?.map(({value, title}) => ({value, content: title})) || [],
        [operations],
    );

    const label = (
        <React.Fragment>
            <span>{i18n('field_operation')}</span>
            <HelpMark
                popoverProps={{
                    placement: ['bottom', 'top'],
                }}
                style={{left: 5}}
            >
                {i18n('field_operation-note')}
            </HelpMark>
        </React.Fragment>
    );

    return (
        <FormRow label={label} className={className}>
            <SelectFeatured
                disabled={isFieldDisabled}
                placeholder="—"
                width="max"
                popupWidth={'fit'}
                value={operation === undefined ? [] : [operation]}
                options={options}
                onUpdate={handleOperationUpdate}
                emptyOptionsText={options?.length ? undefined : i18n('label_no-operations')}
            />
        </FormRow>
    );
};

export {OperationSelector};
