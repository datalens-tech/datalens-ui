import React from 'react';

import {I18n} from 'i18n';
import {DatalensGlobalState} from 'index';
import {connect} from 'react-redux';
import {compose} from 'recompose';

import {CopyWorkbookTemplateResponse} from '../../../../../shared/schema';
import {WorkbookDialog} from '../../../../components/CollectionsStructure/WorkbookDialog/WorkbookDialog';
import {CollectionsDispatch, addDemoWorkbook} from '../../store/actions';
import {selectAddDemoWorkbookIsLoading} from '../../store/selectors';

const i18n = I18n.keyset('collections');

type OuterProps = {
    open: boolean;
    collectionId: string | null;
    demoWorkbookId: string;
    title: string;
    onClose: () => void;
    onSuccessApply?: (result: CopyWorkbookTemplateResponse | null) => Promise<unknown>;
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type InnerProps = StateProps & DispatchProps;

type Props = OuterProps & InnerProps;

class AddDemoWorkbookDialogContainer extends React.Component<Props> {
    render() {
        const {open, isLoading, title, onClose} = this.props;

        return (
            <WorkbookDialog
                title={title}
                textButtonApply={i18n('action_add')}
                open={open}
                isLoading={isLoading}
                isHiddenDescription
                onApply={this.onApply}
                onClose={onClose}
                titleAutoFocus
            />
        );
    }

    private onApply = async ({title}: {title: string}) => {
        const {
            collectionId,
            demoWorkbookId,
            addDemoWorkbook: addDemoWorkbookAction,
            onSuccessApply,
        } = this.props;

        const result = await addDemoWorkbookAction({
            demoWorkbookId,
            collectionId,
            title,
        });

        if (onSuccessApply) {
            await onSuccessApply(result);
        }

        return result;
    };
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        isLoading: selectAddDemoWorkbookIsLoading(state),
    };
};

const mapDispatchToProps = (dispatch: CollectionsDispatch) => {
    return {
        addDemoWorkbook: ({
            demoWorkbookId,
            collectionId,
            title,
        }: {
            demoWorkbookId: string;
            collectionId: string | null;
            title: string;
        }) =>
            dispatch(
                addDemoWorkbook({
                    workbookId: demoWorkbookId,
                    collectionId,
                    title,
                }),
            ),
    };
};

const Container = compose<Props, OuterProps>(connect(mapStateToProps, mapDispatchToProps))(
    AddDemoWorkbookDialogContainer,
);

export {Container as AddDemoWorkbookDialogContainer};
