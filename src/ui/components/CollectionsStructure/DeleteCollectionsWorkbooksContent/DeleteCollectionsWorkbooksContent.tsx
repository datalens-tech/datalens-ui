import React from 'react';

import {Icon, useThemeType} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {IconById} from 'ui/components/IconById/IconById';

import workbookColoredIcon from '../../../assets/icons/collections/workbook-colored.svg';

import './DeleteCollectionsWorkbooksContent.scss';

const i18n = I18n.keyset('component.collections-structure');

const b = block('dl-collections-structure-delete-collections-workbooks-dialog-content');

export type Props = {
    collectionTitles: string[];
    workbookTitles: string[];
};

export const DeleteCollectionsWorkbooksContent = ({collectionTitles, workbookTitles}: Props) => {
    const theme = useThemeType();
    return (
        <div className={b()}>
            {Boolean(collectionTitles.length) && (
                <React.Fragment>
                    <div className={b('header')}>{i18n('label_delete-collections-for-delete')}</div>
                    <div className={b('list')}>
                        {collectionTitles.map((title) => (
                            <div className={b('item')} key={title}>
                                <div className={b('icon')}>
                                    <IconById
                                        id={
                                            theme === 'dark'
                                                ? 'collectionColoredDark'
                                                : 'collectionColored'
                                        }
                                        size={20}
                                    />
                                </div>
                                <div className={b('title')}>{title}</div>
                            </div>
                        ))}
                    </div>
                </React.Fragment>
            )}

            {Boolean(workbookTitles.length) && (
                <React.Fragment>
                    <div className={b('header')}>{i18n('label_delete-workbooks-for-delete')}</div>
                    <div className={b('list')}>
                        {workbookTitles.map((title) => (
                            <div className={b('item')} key={title}>
                                <div className={b('icon')}>
                                    <Icon data={workbookColoredIcon} size={20} />
                                </div>
                                <div key={title} className={b('title')}>
                                    {title}
                                </div>
                            </div>
                        ))}
                    </div>
                </React.Fragment>
            )}
        </div>
    );
};
