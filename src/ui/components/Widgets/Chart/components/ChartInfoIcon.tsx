import React from 'react';

import {ShieldExclamation} from '@gravity-ui/icons';
import {Icon, Popover} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {DL} from '../../../../..//ui/constants/common';
import {useMarkdown} from '../../../../hooks/useMarkdown';

import './ChartInfoIcon.scss';

const b = block('chart-info');

const MarkdownContent = (props: {value: string; onRender: () => void}) => {
    const {value, onRender} = props;
    const {markdown, isLoading} = useMarkdown({value});

    React.useEffect(() => {
        if (!isLoading) {
            onRender();
        }
    }, [isLoading, onRender]);

    return <React.Fragment>{markdown}</React.Fragment>;
};

type Props = {
    msg: string;
};

export const ChartInfoIcon = (props: Props) => {
    const {msg} = props;
    const [isLoaded, setLoaded] = React.useState(false);

    const content = DL.ENDPOINTS.safeChartInfoLink
        ? `${msg}\n[see](${DL.ENDPOINTS.safeChartInfoLink})`
        : msg;

    return (
        <Popover
            content={<MarkdownContent value={content} onRender={() => setLoaded(true)} />}
            key={String(isLoaded)}
            open={isLoaded}
            className={b('tooltip', {hidden: !isLoaded})}
        >
            <Icon size={20} data={ShieldExclamation} className={b('icon')} />
        </Popover>
    );
};
