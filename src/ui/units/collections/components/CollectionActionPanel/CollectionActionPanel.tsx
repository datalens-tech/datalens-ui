import React from 'react';

import block from 'bem-cn-lite';
import {useSelector} from 'react-redux';
import {selectAsideHeaderData} from 'ui/store/selectors/asideHeader';

import './CollectionActionPanel.scss';

const b = block('dl-collection-action-panel');

type Props = {
    leftBlock?: React.ReactNode;
    rightBlock?: React.ReactNode;
};

export const CollectionActionPanel = React.memo<Props>(({leftBlock, rightBlock}) => {
    const asideHeaderData = useSelector(selectAsideHeaderData);
    const asideHeaderSize = asideHeaderData.size || 0;

    const leftStyle: React.CSSProperties = {left: asideHeaderSize};

    return (
        <div className={b()}>
            <div className={b('container')} style={leftStyle}>
                {leftBlock && <div className={b('left-block')}>{leftBlock}</div>}
                {rightBlock && <div className={b('right-block')}>{rightBlock}</div>}
            </div>
        </div>
    );
});

CollectionActionPanel.displayName = 'CollectionActionPanel';
