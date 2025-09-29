import React from 'react';

import {Pencil} from '@gravity-ui/icons';
import {Button, Flex, Icon, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

const b = block('dl-field-editor');

interface NameFieldProps {
    title: string;
    onStartEdit: () => void;
}

export const NameHeader = ({title, onStartEdit}: NameFieldProps) => {
    return (
        <Flex alignItems="center" className={b('settings-name')} onDoubleClick={onStartEdit}>
            <Text variant="subheader-3" ellipsis={true}>
                {title}
            </Text>
            <Button view="flat" onClick={onStartEdit} className={b('settings-field-name-icon')}>
                <Icon data={Pencil} size={16} />
            </Button>
        </Flex>
    );
};
