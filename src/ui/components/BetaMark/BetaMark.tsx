import React from 'react';

import block from 'bem-cn-lite';

import './BetaMark.scss';

const b = block('beta-mark');

type BetaMarkProps = {
    className?: string;
};

export const BetaMark: React.FC<BetaMarkProps> = (props) => {
    return <span className={b(null, props.className)}>beta</span>;
};
