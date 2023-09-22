import React from 'react';

import block from 'bem-cn-lite';

import './Wrapper.scss';

const b = block('control-wrapper');

export interface WrapperProps {
    title?: string;
    overflow?: boolean;
}

const Wrapper: React.FunctionComponent<WrapperProps> = ({title, overflow, children}) => {
    return (
        <div className={b()}>
            <div className={b('title')}>{title}</div>
            <div className={b('children', {overflow})}>{children}</div>
        </div>
    );
};

Wrapper.defaultProps = {
    overflow: true,
};

export default Wrapper;
