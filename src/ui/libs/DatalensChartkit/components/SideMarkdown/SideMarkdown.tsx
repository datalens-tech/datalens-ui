import React from 'react';

import {Xmark} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import logger from 'libs/logger';
import {fetchRenderedMarkdown} from 'ui/utils/sdkRequests';

import './SideMarkdown.scss';

const b = block('side-markdown');

type SideMarkdownProps = {
    data: string;
};

export const SideMarkdown = ({data}: SideMarkdownProps) => {
    const [markdown, setMarkdown] = React.useState<{result: string}>({result: ''});
    const [visible, setVisible] = React.useState(true);

    const fetchData = React.useCallback(async () => {
        try {
            const result = await fetchRenderedMarkdown(data);
            setMarkdown(result);
        } catch (error) {
            logger.logError('SideMarkdown: fetchRenderedMarkdown failed', error);
        }
    }, [data]);

    const handleButtonClick = () => setVisible(false);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (!markdown.result || !visible) {
        return null;
    }

    return (
        <div className={b()}>
            <Button view="flat-secondary" className={b('close-button')} onClick={handleButtonClick}>
                <Icon data={Xmark} height={16} width={16} />
            </Button>
            <div className={b('body')}>
                <div dangerouslySetInnerHTML={{__html: markdown.result}} />
            </div>
        </div>
    );
};
