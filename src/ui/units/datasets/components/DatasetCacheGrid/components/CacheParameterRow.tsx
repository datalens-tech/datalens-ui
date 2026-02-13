import React from 'react';

import {Button, Icon, spacing} from '@gravity-ui/uikit';

import {getEarlyInvalidationCacheMockText} from '../../../helpers/mockTexts';

import {Row} from './Row';

import PencilToLineIcon from '@gravity-ui/icons/svgs/pencil-to-line.svg';
import PlusIcon from '@gravity-ui/icons/svgs/plus.svg';
import TrashBinIcon from '@gravity-ui/icons/svgs/trash-bin.svg';

type CacheParameterRowProps = {
    label: string;
    onAdd: () => void;
    onEdit: () => void;
    onDelete: () => void;
    parameterExist: boolean;
    readonly: boolean;
};

export const CacheParameterRow = ({
    label,
    onDelete,
    onAdd,
    onEdit,
    parameterExist,
    readonly,
}: CacheParameterRowProps) => {
    return (
        <Row label={label}>
            {parameterExist ? (
                <React.Fragment>
                    <Button disabled={readonly} onClick={onEdit} className={spacing({mr: 2})}>
                        <Icon data={PencilToLineIcon} />
                        {getEarlyInvalidationCacheMockText('edit-parameter-btn-text')}
                    </Button>
                    <Button disabled={readonly} onClick={onDelete}>
                        <Icon data={TrashBinIcon} />
                    </Button>
                </React.Fragment>
            ) : (
                <Button disabled={readonly} onClick={onAdd}>
                    <Icon data={PlusIcon} />
                    {getEarlyInvalidationCacheMockText('add-parameter-btn-text')}
                </Button>
            )}
        </Row>
    );
};
