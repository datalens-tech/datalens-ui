import React from 'react';

import {Checkbox} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {registry} from 'ui/registry';

import type {HookBatchSelectResult, TableViewProps} from '../types';

const b = block('dl-core-navigation-table-view');
const i18n = I18n.keyset('component.navigation.view');

type RowHeaderProps = Pick<
    TableViewProps,
    'mode' | 'displayParentFolder' | 'isOnlyCollectionsMode'
> &
    Pick<HookBatchSelectResult, 'isAllCheckBoxChecked' | 'onAllCheckBoxSelect'>;

export const RowHeader = ({
    mode,
    displayParentFolder,
    isAllCheckBoxChecked,
    onAllCheckBoxSelect,
    isOnlyCollectionsMode,
}: RowHeaderProps) => {
    const {getLoginById} = registry.common.functions.getAll();
    const isLoginByIdExist = Boolean(getLoginById());

    return (
        <div
            className={b('row', {
                mode,
                header: true,
                withParentFolder: displayParentFolder,
                'collections-mode-only': isOnlyCollectionsMode,
            })}
        >
            {!isOnlyCollectionsMode && (
                <div className={b('selection-checkbox')}>
                    <Checkbox
                        size="l"
                        checked={isAllCheckBoxChecked}
                        disabled={false}
                        onUpdate={onAllCheckBoxSelect}
                    />
                </div>
            )}
            <div className={b('row-link-wrap')}>
                <div className={b('link')}>
                    <div className={b('info')}>
                        <div className={b('name')}>
                            <div className={b('name-line')}>
                                <span>{i18n('label_table-column-entry-name')}</span>
                            </div>
                            {displayParentFolder && (
                                <div className={b('parent-folder')}>
                                    <div className={b('folder-inline')} />
                                    <span className={b('parent-folder-name')} />
                                </div>
                            )}
                        </div>
                        {isLoginByIdExist && (
                            <div className={b('createdBy')}>
                                <span>{i18n('label_table-column-author')}</span>
                            </div>
                        )}
                        <div className={b('date')}>
                            <span>{i18n('label_table-column-date')}</span>
                        </div>
                        <div className={b('row-btns')} />
                    </div>
                </div>
            </div>
        </div>
    );
};
