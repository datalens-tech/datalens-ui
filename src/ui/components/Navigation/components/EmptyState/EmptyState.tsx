import React from 'react';

import {I18n} from 'i18n';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';
import {DL} from 'ui/constants';
import block from 'bem-cn-lite';

import {MODE_MINIMAL, PLACE} from '../../constants';

import './EmptyState.scss';

const i18n = I18n.keyset('component.navigation.view');
const b = block('dl-navigation-empty-state');

export type EmptyStateProps = {
    isEmptyFolder?: boolean;
    className?: string;
    mode: string;
    place: string;
    renderAction: () => React.ReactNode;
};

const getTitleByPlace = (scope: string) => {
    switch (scope) {
        case PLACE.FAVORITES:
            return i18n('label_empty-favorites');
        case PLACE.CONNECTIONS:
            return i18n('label_empty-connections');
        case PLACE.DATASETS:
            return i18n('label_empty-datasets');
        case PLACE.WIDGETS:
            return i18n('label_empty-widgets');
        case PLACE.DASHBOARDS:
            return i18n('label_empty-dashboards');
        default:
            return i18n('label_empty-folder')
    }
};

const getDescriptionByPlace = (scope: string) => {
    switch (scope) {
        case PLACE.CONNECTIONS:
            return i18n('label-description_empty-connections');
        case PLACE.DATASETS:
            return i18n('label-description_empty-datasets');
        case PLACE.WIDGETS:
            return i18n('label-description_empty-widgets');
        case PLACE.DASHBOARDS:
            return i18n('label-description_empty-dashboards');
        default:
            return '';
    }
};

const TEMPLATE_EMPTY_PLACES: string[] = [PLACE.FAVORITES, PLACE.CONNECTIONS, PLACE.DATASETS, PLACE.WIDGETS, PLACE.DASHBOARDS];

export const EmptyState = ({isEmptyFolder, className, mode, place, renderAction}: EmptyStateProps) => {
    const emptyText = isEmptyFolder ? getTitleByPlace(place) : i18n('label_not-found');
    const emptyDescription = getDescriptionByPlace(place);

    const isTemplateEmptyFolder = TEMPLATE_EMPTY_PLACES.includes(place);
    const name = isEmptyFolder ? isTemplateEmptyFolder ? 'template' : 'emptyDirectory' : 'notFound';
    const illustrationSize = mode === MODE_MINIMAL && !DL.IS_MOBILE ? 'm' : 'l';

    return (
        <div className={className}>
            <PlaceholderIllustration
                name={name}
                title={emptyText}
                description={emptyDescription}
                direction="column"
                size={illustrationSize}
                renderAction={isTemplateEmptyFolder ? () => (<div className={b('action')}>{renderAction()}</div>) : undefined}
            />
        </div>
    );
};
