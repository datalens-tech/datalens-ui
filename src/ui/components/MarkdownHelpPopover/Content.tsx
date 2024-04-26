import React from 'react';

import {useMarkdown} from '../../hooks/useMarkdown';

type Props = {
    value: string;
    onRender: () => void;
};

export const Content = (props: Props) => {
    const {value, onRender} = props;
    const {markdown, isLoading} = useMarkdown({value});

    React.useEffect(() => {
        if (!isLoading) {
            onRender();
        }
    }, [isLoading, onRender]);

    return <React.Fragment>{markdown}</React.Fragment>;
};
