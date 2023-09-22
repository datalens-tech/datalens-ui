import React from 'react';

import {I18n} from 'i18n';
import {DatalensGlobalState} from 'index';
import {connect} from 'react-redux';
import {compose} from 'recompose';

import {DeleteDialog} from '../../components/DeleteDialog/DeleteDialog';
import {CollectionsDispatch, deleteWorkbook} from '../../store/actions';
import {selectDeleteWorkbookIsLoading} from '../../store/selectors';

const i18n = I18n.keyset('collections');

type OuterProps = {
    workbookId: string;
    workbookTitle: string;
    open: boolean;
    deleteInItems?: boolean;
    onClose: () => void;
    onSuccessApply?: () => Promise<unknown>;
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type InnerProps = StateProps & DispatchProps;

type Props = OuterProps & InnerProps;

class DeleteWorkbookDialogContainer extends React.Component<Props> {
    render() {
        const {open, workbookTitle, isLoading, onClose} = this.props;

        return (
            <DeleteDialog
                title={i18n('label_delete-workbook')}
                description={i18n('section_delete-workbook', {
                    workbook: workbookTitle,
                })}
                textButtonApply={i18n('action_delete')}
                open={open}
                isLoading={isLoading}
                onApply={this.onApply}
                onClose={onClose}
            />
        );
    }

    private onApply = async () => {
        const {
            workbookId,
            deleteInItems,
            deleteWorkbook: deleteWorkbookAction,
            onSuccessApply,
        } = this.props;

        const result = await deleteWorkbookAction({
            workbookId,
            deleteInItems,
        });

        if (onSuccessApply) {
            await onSuccessApply();
        }

        return result;
    };
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        isLoading: selectDeleteWorkbookIsLoading(state),
    };
};

const mapDispatchToProps = (dispatch: CollectionsDispatch) => {
    return {
        deleteWorkbook: (args: {workbookId: string; deleteInItems?: boolean}) =>
            dispatch(deleteWorkbook(args)),
    };
};

const Container = compose<Props, OuterProps>(connect(mapStateToProps, mapDispatchToProps))(
    DeleteWorkbookDialogContainer,
);

export {Container as DeleteWorkbookDialogContainer};
