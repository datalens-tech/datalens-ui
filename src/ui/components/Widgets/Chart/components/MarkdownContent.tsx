import React from 'react';

import {useMarkdown} from '../../../../hooks/useMarkdown';

export const MarkdownContent = (props: {value: string}) => {
    const {value} = props;
    const {markdown} = useMarkdown({value});

    return <React.Fragment>{markdown}</React.Fragment>;
};
