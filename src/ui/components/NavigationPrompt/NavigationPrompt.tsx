import React from 'react';

import type History from 'history';
import {i18n} from 'i18n';
import {Prompt, useLocation} from 'react-router-dom';

type Props = {
    when: boolean;
};

const NavigationPrompt: React.FC<Props> = (props) => {
    const currentLocation = useLocation();

    const message = React.useCallback(
        (location: History.Location<unknown>) => {
            if (location.pathname !== currentLocation.pathname) {
                return i18n('component.navigation-prompt', 'label_prompt-message');
            }

            return true;
        },
        [currentLocation.pathname],
    );

    return <Prompt when={props.when} message={message} />;
};

export default NavigationPrompt;
