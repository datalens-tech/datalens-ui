import React from 'react';

import ErrorText from '../../ErrorText/ErrorText';

type Props = {
    query?: string;
};

const DatabaseRequestTab: React.FC<Props> = ({query}: Props) => {
    if (!query) {
        return null;
    }

    return <ErrorText errorMessage={query} />;
};

export default DatabaseRequestTab;
