import React from 'react';

import {ShieldExclamation} from '@gravity-ui/icons';
import {Icon, Popover} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {DL} from '../../../../..//ui/constants/common';
import {useMarkdown} from '../../../../hooks/useMarkdown';

import './ChartInfoIcon.scss';

const b = block('chart-info');

const MarkdownContent = (props: {value: string; className?: string; onRender?: () => void}) => {
    const {value, className, onRender} = props;
    const {markdown, isLoading} = useMarkdown({value});

    React.useEffect(() => {
        if (!isLoading) {
            onRender?.();
        }
    }, [isLoading, onRender]);

    return <div className={className}>{markdown}</div>;
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
            content={
                <MarkdownContent
                    className={b('tooltip-content', {hidden: !isLoaded})}
                    value={content}
                    onRender={() => setLoaded(true)}
                />
            }
        >
            <Icon size={20} data={ShieldExclamation} className={b('icon')} />
        </Popover>
    );
};
