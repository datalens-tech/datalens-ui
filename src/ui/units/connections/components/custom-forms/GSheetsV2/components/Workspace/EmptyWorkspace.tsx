import React from 'react';

import {I18n} from 'i18n';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';

const i18n = I18n.keyset('connections.gsheet.view');

export const EmptyWorkspace = () => {
    return (
        <PlaceholderIllustration
            name="template"
            description={i18n('label_workspace-placeholder')}
        />
    );
};
