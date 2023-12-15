import React from 'react';

import block from 'bem-cn-lite';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';

import {i18n8857} from '../constants';

const b = block('conn-form-gsheets');

export const EmptyWorkspace = () => {
    return (
        <PlaceholderIllustration
            name="template"
            description={i18n8857['label_workspace-placeholder']}
        />
    );
};

export const Workspace = () => {
    const mods = {
        empty: true,
    };

    return (
        <div className={b('workspace', mods)}>
            <EmptyWorkspace />
        </div>
    );
};
