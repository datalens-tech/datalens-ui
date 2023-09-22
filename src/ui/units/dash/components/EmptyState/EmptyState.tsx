import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';
import {DL} from 'ui/constants';

import {AddWidget, AddWidgetProps} from '../DashActionPanel/AddWidget/AddWidget';

import './EmptyState.scss';

const b = block('dash-empty-state');
const i18n = I18n.keyset('dash.empty-state.view');

type EmptyStateProps = {
    isEditMode: boolean;
    canEdit: boolean;
    isTabView: boolean;
    onEditClick?: () => void;
    openDialog?: () => void;
    onPasteItem?: AddWidgetProps['onPasteWidget'];
    isEditModeLoading?: boolean;
    hideEditButtons?: boolean;
};

export const EmptyState = ({
    isEditMode,
    canEdit,
    isTabView,
    onEditClick,
    onPasteItem,
    openDialog,
    isEditModeLoading,
    hideEditButtons,
}: EmptyStateProps) => {
    const showActions = !DL.IS_MOBILE && canEdit && openDialog && onPasteItem;

    const title = isTabView ? i18n('label_empty-tab') : i18n('label_empty-dash');

    const getDescription = () => {
        if (DL.IS_MOBILE && canEdit) {
            return isTabView ? i18n('label_mobile-tab') : i18n('label_mobile-dash');
        }
        return canEdit ? i18n('label_with-edit-rights') : i18n('label_without-edit-rights');
    };

    const viewControl =
        (!isEditMode && (
            <Button view="action" size="l" loading={isEditModeLoading} onClick={onEditClick}>
                {i18n('button_edit')}
            </Button>
        )) ||
        null;

    const editControls =
        (isEditMode && !hideEditButtons && openDialog && onPasteItem && (
            <AddWidget buttonSize="l" openDialog={openDialog} onPasteWidget={onPasteItem} />
        )) ||
        null;

    const renderAction = () => {
        return (
            <React.Fragment>
                {showActions && (
                    <div className={b('action')}>
                        {viewControl}
                        {editControls}
                    </div>
                )}
            </React.Fragment>
        );
    };

    return (
        <div className={b()}>
            <PlaceholderIllustration
                renderAction={renderAction}
                title={title}
                description={getDescription()}
                name="template"
            />
        </div>
    );
};
