import {MouseEventHandler} from 'react';

const onClickStopPropagation: MouseEventHandler = (e) => {
    e.stopPropagation();
    e.preventDefault();
};

export {onClickStopPropagation};
