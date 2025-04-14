import React from 'react';

import {ChevronLeft} from '@gravity-ui/icons';
import {Button, Flex, Icon} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useHistory} from 'react-router-dom';

import {AUTH_ROUTE} from '../../../constants/routes';

const i18n = I18n.keyset('auth.sign-up');

export const Back = () => {
    const history = useHistory();

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if (event.ctrlKey || event.metaKey) {
            return;
        }
        event.preventDefault();
        history.replace(AUTH_ROUTE.SIGNIN);
    };

    return (
        <Flex>
            <Button size="m" view="flat-secondary" href={AUTH_ROUTE.SIGNIN} onClick={handleClick}>
                <Icon data={ChevronLeft} size={16} />
                {i18n('button_back')}
            </Button>
        </Flex>
    );
};
