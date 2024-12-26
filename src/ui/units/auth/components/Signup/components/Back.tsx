import React from 'react';

import {ChevronLeft} from '@gravity-ui/icons';
import {Button, Flex, Icon} from '@gravity-ui/uikit';
import {useHistory} from 'react-router-dom';

export const Back = () => {
    const history = useHistory();

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if (event.ctrlKey || event.metaKey) {
            return;
        }
        event.preventDefault();
        history.replace('/auth/signin');
    };

    return (
        <Flex>
            <Button size="s" view="flat-secondary" href="/auth/signin" onClick={handleClick}>
                <Icon data={ChevronLeft} size={16} />
                Back
            </Button>
        </Flex>
    );
};
