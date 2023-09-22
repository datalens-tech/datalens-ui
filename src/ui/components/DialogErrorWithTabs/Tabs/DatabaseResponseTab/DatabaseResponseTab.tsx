import React from 'react';

import ErrorText from '../../ErrorText/ErrorText';

type Props = {
    message?: string;
};

const DatabaseResponseTab: React.FC<Props> = ({message}: Props) => {
    if (!message) {
        return null;
    }

    return <ErrorText errorMessage={message} />;
};

export default DatabaseResponseTab;
