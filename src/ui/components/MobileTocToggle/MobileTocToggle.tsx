import React from 'react';

import {ChevronDown} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {TableOfContentQa} from 'shared';

import './MobileTocToggle.scss';

const b = block('mobile-toc-toggle');

const i18n = I18n.keyset('dash.table-of-content.view');

export const MobileTocToggle = ({onClick}: {onClick: () => void}) => {
    return (
        <div className={b()} onClick={onClick} data-qa={TableOfContentQa.MobileTableOfContent}>
            {i18n('label_table-of-content')}
            <Icon data={ChevronDown} />
        </div>
    );
};
