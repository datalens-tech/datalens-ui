import React from 'react';

import {I18n} from 'i18n';
import {DatalensGlobalState} from 'index';
import {connect} from 'react-redux';
import {compose} from 'recompose';

import {DeleteDialog} from '../../components/DeleteDialog/DeleteDialog';
import {CollectionsDispatch, deleteCollection} from '../../store/actions';
import {selectDeleteCollectionIsLoading} from '../../store/selectors';

const i18n = I18n.keyset('collections');

type OuterProps = {
    collectionId: string;
    open: boolean;
    deleteInItems?: boolean;
    onClose: () => void;
    onSuccessApply?: () => Promise<unknown>;
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type InnerProps = StateProps & DispatchProps;

type Props = OuterProps & InnerProps;

class DeleteCollectionDialogContainer extends React.Component<Props> {
    render() {
        const {open, isLoading, onClose} = this.props;

        return (
            <DeleteDialog
                title={i18n('label_delete-collection')}
                description={i18n('section_delete-collection')}
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
            collectionId,
            deleteInItems,
            deleteCollection: deleteCollectionAction,
            onSuccessApply,
        } = this.props;

        const result = await deleteCollectionAction({
            collectionId,
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
        isLoading: selectDeleteCollectionIsLoading(state),
    };
};

const mapDispatchToProps = (dispatch: CollectionsDispatch) => {
    return {
        deleteCollection: (args: {collectionId: string; deleteInItems?: boolean}) =>
            dispatch(deleteCollection(args)),
    };
};

const Container = compose<Props, OuterProps>(connect(mapStateToProps, mapDispatchToProps))(
    DeleteCollectionDialogContainer,
);

export {Container as DeleteCollectionDialogContainer};
