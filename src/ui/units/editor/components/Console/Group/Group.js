import React, {useState} from 'react';

import block from 'bem-cn-lite';
import PropTypes from 'prop-types';

import './Group.scss';

const b = block('console-group');

function ConsoleGroup({children, name}) {
    const [open, toggle] = useState(true);
    return (
        <div className={b()}>
            <div>
                <span onClick={() => toggle(!open)}>
                    <span className={b('toggler', {open})}>▶</span>
                    <span className={b('name')}>{name}</span>
                </span>
            </div>
            {open && <div className={b('content')}>{children}</div>}
        </div>
    );
}

ConsoleGroup.propTypes = {
    children: PropTypes.any,
    name: PropTypes.string,
};

export default ConsoleGroup;
