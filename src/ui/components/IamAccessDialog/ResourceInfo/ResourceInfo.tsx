import React from 'react';

import {Icon, useThemeType} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {ResourceType} from '../../../store/actions/iamAccessDialog';
import {IconById} from '../../IconById/IconById';

import workbookColoredIcon from '../../../assets/icons/collections/workbook-colored.svg';

import './ResourceInfo.scss';

const b = block('dl-iam-access-dialog-resource-info');

export type Props = {
    type: ResourceType;
    title: string;
};

export const ResourceInfo = ({type, title}: Props) => {
    const theme = useThemeType();

    return (
        <div className={b()}>
            <div className={b('icon')}>
                {type === ResourceType.Collection ? (
                    <IconById
                        id={theme === 'dark' ? 'collectionColoredDark' : 'collectionColored'}
                        size={20}
                    />
                ) : (
                    <Icon data={workbookColoredIcon} size={20} />
                )}
            </div>
            <div className={b('title')}>{title}</div>
        </div>
    );
};
