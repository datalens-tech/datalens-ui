import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';
import {DL} from 'ui/constants';

import {MODE_MINIMAL, PLACE} from '../../constants';

import {getDescriptionByPlace, getTitleByPlace} from './utils';

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

const TEMPLATE_EMPTY_PLACES: string[] = [
    PLACE.FAVORITES,
    PLACE.CONNECTIONS,
    PLACE.DATASETS,
    PLACE.WIDGETS,
    PLACE.DASHBOARDS,
    PLACE.REPORTS,
];

const HIDE_ACTION_PLACES: string[] = [PLACE.FAVORITES];

export const EmptyState = ({
    isEmptyFolder,
    className,
    mode,
    place,
    renderAction,
}: EmptyStateProps) => {
    const emptyText = isEmptyFolder ? getTitleByPlace(place) : i18n('label_not-found');
    const emptyDescription = getDescriptionByPlace(place);

    const isTemplateEmptyFolder = TEMPLATE_EMPTY_PLACES.includes(place);

    const emptyFolderName = isTemplateEmptyFolder ? 'template' : 'emptyDirectory';
    const name = isEmptyFolder ? emptyFolderName : 'notFound';

    const illustrationSize = mode === MODE_MINIMAL && !DL.IS_MOBILE ? 'm' : 'l';

    return (
        <div className={className}>
            <PlaceholderIllustration
                name={name}
                title={emptyText}
                description={emptyDescription}
                direction="column"
                size={illustrationSize}
                renderAction={
                    isTemplateEmptyFolder && !HIDE_ACTION_PLACES.includes(place)
                        ? () => <div className={b('action')}>{renderAction()}</div>
                        : undefined
                }
            />
        </div>
    );
};
