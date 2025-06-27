import React from 'react';

import {PlaceholderContainer} from '@gravity-ui/uikit';
import {DL} from 'ui/constants';
import {registry} from 'ui/registry';

import type {PlaceholderIllustrationProps} from './types';

export const PlaceholderIllustration = ({
    name,
    renderAction,
    title,
    description,
    direction,
    size = 'l',
    className,
}: PlaceholderIllustrationProps) => {
    const placeholderDirection = direction || (DL.IS_MOBILE ? 'column' : 'row');

    const renderImage = React.useCallback(() => {
        const {PlaceholderIllustrationImage} = registry.common.components.getAll();
        const {getIllustrationStore} = registry.common.functions.getAll();

        const store = getIllustrationStore();

        return <PlaceholderIllustrationImage illustrationStore={store} name={name} size={size} />;
    }, [name, size]);

    return (
        <PlaceholderContainer
            image={renderImage()}
            size={size}
            title={title}
            className={className}
            description={description}
            actions={renderAction}
            direction={placeholderDirection}
        />
    );
};
