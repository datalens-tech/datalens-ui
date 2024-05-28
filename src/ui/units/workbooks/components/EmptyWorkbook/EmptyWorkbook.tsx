import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {EntryScope} from 'shared';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';
import {isMobileView} from 'ui/utils/mobile';

import {WorkbookWithPermissions} from '../../../../../shared/schema';
import {WorkbookEntriesFilters} from '../../types';
import {CreateEntry} from '../CreateEntry/CreateEntry';

import './EmptyWorkbook.scss';

const b = block('dl-workbook-empty');
const i18n = I18n.keyset('new-workbooks.empty-table');

type Props = {
    workbook: WorkbookWithPermissions;
    filters: WorkbookEntriesFilters;
    scope?: EntryScope;
    onChangeFilters: (filters: Partial<WorkbookEntriesFilters>) => void;
};

export const EmptyWorkbook = ({workbook, filters, onChangeFilters, scope}: Props) => {
    const isFiltersChanged = Boolean(filters.filterString);

    const handleClearFilters = () => onChangeFilters({filterString: undefined});

    const {title, description} = getText(scope);

    const renderClearFiltersAction = () => {
        return (
            <Button className={b('controls')} view="normal" onClick={handleClearFilters}>
                {i18n('button_clear-filters')}
            </Button>
        );
    };

    const renderCreateEntryAction = () => {
        if (workbook.permissions.update && !isMobileView) {
            return <CreateEntry className={b('controls')} scope={scope || EntryScope.Connection} />;
        }
        return null;
    };
    if (isFiltersChanged && !isMobileView) {
        return (
            <div className={b()}>
                <PlaceholderIllustration
                    name="notFound"
                    title={i18n('section_not-found')}
                    description={i18n('label_not-found-description')}
                    renderAction={renderClearFiltersAction}
                />
            </div>
        );
    }

    return (
        <div className={b()}>
            <PlaceholderIllustration
                name="template"
                title={title}
                description={workbook.permissions.update ? description : undefined}
                renderAction={renderCreateEntryAction}
            />
        </div>
    );
};

function getText(scope: EntryScope | undefined) {
    let title: string;
    let description = '';

    switch (scope) {
        case EntryScope.Dash: {
            title = i18n('section_empty-scope-dashboard');

            break;
        }
        case EntryScope.Widget: {
            title = i18n('section_empty-scope-widget');

            break;
        }
        case EntryScope.Dataset: {
            title = i18n('section_empty-scope-dataset');

            break;
        }
        case EntryScope.Connection: {
            title = i18n('section_empty-scope-connection');

            break;
        }
        default: {
            title = i18n('section_empty-scope-all');
            description = i18n('label_empty-scope-all-description');
        }
    }

    return {title, description};
}
