import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {EntryScope} from 'shared';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';
import {YfmWrapper} from 'ui/components/YfmWrapper/YfmWrapper';
import {DL} from 'ui/constants/common';
import {registry} from 'ui/registry';

import type {WorkbookWithPermissions} from '../../../../../shared/schema';
import type {WorkbookEntriesFilters} from '../../types';
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
    const {checkWbCreateEntryButtonVisibility, getWorkbookEmptyStateTexts} =
        registry.workbooks.functions.getAll();
    const isFiltersChanged = Boolean(filters.filterString);

    const handleClearFilters = () => onChangeFilters({filterString: undefined});

    const {title, description} = getWorkbookEmptyStateTexts(scope);

    const renderClearFiltersAction = () => {
        return (
            <Button className={b('controls')} view="normal" onClick={handleClearFilters}>
                {i18n('button_clear-filters')}
            </Button>
        );
    };

    const renderCreateEntryAction = () => {
        if (checkWbCreateEntryButtonVisibility(workbook, scope)) {
            return (
                <CreateEntry
                    workbook={workbook}
                    className={b('controls')}
                    scope={scope || EntryScope.Connection}
                />
            );
        }
        return null;
    };
    if (isFiltersChanged && !DL.IS_MOBILE) {
        return (
            <div className={b()}>
                <PlaceholderIllustration
                    name="notFound"
                    title={i18n('section_not-found')}
                    description={
                        <YfmWrapper
                            content={i18n('label_not-found-description')}
                            setByInnerHtml={true}
                        />
                    }
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
                description={
                    workbook.permissions.update ? (
                        <YfmWrapper content={description} setByInnerHtml={true} />
                    ) : undefined
                }
                renderAction={renderCreateEntryAction}
            />
        </div>
    );
};
