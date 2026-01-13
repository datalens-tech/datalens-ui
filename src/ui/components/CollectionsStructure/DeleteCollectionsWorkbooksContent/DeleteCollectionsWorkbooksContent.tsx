import React from 'react';

import {Icon, useThemeType} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {EntryScope} from 'shared';
import {EntryIcon} from 'ui/components/EntryIcon/EntryIcon';
import {IconById} from 'ui/components/IconById/IconById';
import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';

import workbookColoredIcon from '../../../assets/icons/collections/workbook-colored.svg';

import './DeleteCollectionsWorkbooksContent.scss';

const i18n = I18n.keyset('component.collections-structure');

const b = block('dl-collections-structure-delete-collections-workbooks-dialog-content');

export type Props = {
    collectionTitles: string[];
    workbookTitles: string[];
    datasetTitles: string[];
    connectionTitles: string[];
};

export const DeleteCollectionsWorkbooksContent = ({
    collectionTitles,
    workbookTitles,
    datasetTitles,
    connectionTitles,
}: Props) => {
    const theme = useThemeType();
    return (
        <div className={b()}>
            {Boolean(collectionTitles.length) && (
                <React.Fragment>
                    <div className={b('header')}>
                        {i18n('label_delete-collections-for-delete')}:
                    </div>
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
                    <div className={b('header')}>{i18n('label_delete-workbooks-for-delete')}:</div>
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

            {Boolean(connectionTitles.length) && (
                <React.Fragment>
                    <div className={b('header')}>
                        {getSharedEntryMockText('label_delete-connections-for-delete')}:
                    </div>
                    <div className={b('list')}>
                        {connectionTitles.map((title) => (
                            <div className={b('item')} key={title}>
                                <div className={b('icon')}>
                                    <EntryIcon
                                        entityIconProps={{
                                            classNameColorBox: 'custom-color-box',
                                        }}
                                        className={b('entry-icon')}
                                        entry={{scope: EntryScope.Connection}}
                                        overrideIconType={EntryScope.Connection}
                                    />
                                </div>
                                <div key={title} className={b('title')}>
                                    {title}
                                </div>
                            </div>
                        ))}
                    </div>
                </React.Fragment>
            )}

            {Boolean(datasetTitles.length) && (
                <React.Fragment>
                    <div className={b('header')}>
                        {getSharedEntryMockText('label_delete-datasets-for-delete')}:
                    </div>
                    <div className={b('list')}>
                        {datasetTitles.map((title) => (
                            <div className={b('item')} key={title}>
                                <div className={b('icon')}>
                                    <EntryIcon
                                        entityIconProps={{
                                            classNameColorBox: 'custom-color-box',
                                        }}
                                        className={b('entry-icon')}
                                        entry={{scope: EntryScope.Dataset}}
                                    />
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
