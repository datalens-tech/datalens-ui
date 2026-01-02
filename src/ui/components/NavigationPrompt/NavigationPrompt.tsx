import React from 'react';

import type History from 'history';
import {i18n} from 'i18n';
import {Prompt, useLocation} from 'react-router-dom';

type Props = {
    when: boolean;
};

const NavigationPrompt: React.FC<Props> = ({when}) => {
    const {pathname} = useLocation();

    return (
        <Prompt
            when={when}
            message={(location: History.Location<unknown>) => {
                return location.pathname === pathname
                    ? true
                    : i18n('component.navigation-prompt', 'label_prompt-message');
            }}
        />
    );
};

export default NavigationPrompt;
