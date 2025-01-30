import React from 'react';

import {Alert} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {EDITOR_TYPE} from 'shared/constants';
import {EntryScope} from 'shared/types';
import type {RenderDialogRelatedEntitiesAlertHint} from 'ui/registry/units/common/types/functions/renderDialogRelatedEntitiesAlertHint';

import {Direction} from './constants';

const i18n = I18n.keyset('component.dialog-related-entities.view');

export const renderDialogRelatedEntitiesAlertHint: RenderDialogRelatedEntitiesAlertHint = ({
    entryScope,
    entryType,
    direction,
}) => {
    if (
        entryScope === EntryScope.Widget &&
        Object.values(EDITOR_TYPE).includes(entryType) &&
        direction === Direction.PARENT
    ) {
        return <Alert theme="warning" message={i18n('label_editor-hint')} />;
    }

    return null;
};
