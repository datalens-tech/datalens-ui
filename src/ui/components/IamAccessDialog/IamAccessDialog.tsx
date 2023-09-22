import React from 'react';

import {registry} from 'ui/registry';
import {IamAccessDialogProps} from 'ui/registry/units/common/types/components/IamAccessDialog';

export const IamAccessDialog = React.memo<IamAccessDialogProps>((props) => {
    const {IamAccessDialogComponent} = registry.common.components.getAll();

    return <IamAccessDialogComponent {...props} />;
});

IamAccessDialog.displayName = 'IamAccessDialog';
