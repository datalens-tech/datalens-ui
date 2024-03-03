import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import {CopyWorkbookTemplateResponse} from '../../../../../shared/schema';
import {WorkbookDialog} from '../../../../components/CollectionsStructure/WorkbookDialog/WorkbookDialog';
import {AppDispatch} from '../../../../store';
import {addDemoWorkbook} from '../../store/actions';
import {selectAddDemoWorkbookIsLoading} from '../../store/selectors';

const i18n = I18n.keyset('collections');

type Props = {
    open: boolean;
    collectionId: string | null;
    demoWorkbookId: string;
    title: string;
    onClose: () => void;
    onSuccessApply?: (result: CopyWorkbookTemplateResponse | null) => Promise<unknown>;
};

export const AddDemoWorkbookDialog: React.FC<Props> = ({
    open,
    collectionId,
    demoWorkbookId,
    title,
    onClose,
    onSuccessApply,
}) => {
    const dispatch: AppDispatch = useDispatch();
    const isLoading = useSelector(selectAddDemoWorkbookIsLoading);

    const onApply = React.useCallback(async () => {
        const result = await dispatch(
            addDemoWorkbook({
                workbookId: demoWorkbookId,
                collectionId,
                title,
            }),
        );

        if (onSuccessApply) {
            await onSuccessApply(result);
        }

        return result;
    }, [collectionId, demoWorkbookId, dispatch, onSuccessApply, title]);

    return (
        <WorkbookDialog
            title={title}
            textButtonApply={i18n('action_add')}
            open={open}
            isLoading={isLoading}
            isHiddenDescription
            onApply={onApply}
            onClose={onClose}
            titleAutoFocus
        />
    );
};
