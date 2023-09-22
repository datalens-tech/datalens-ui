import React, {PureComponent} from 'react';

import block from 'bem-cn-lite';

import './UserName.scss';

const b = block('user-name-block');
const bInline = block('user-name-inline');

interface Props {
    name: string;
    inline: boolean;
}

class UserName extends PureComponent<Props> {
    render() {
        const {inline, name, children} = this.props;

        const user = name || children;

        return inline ? (
            <span className={bInline()}>{user}</span>
        ) : (
            <div className={b()}>
                <div className={b('name')}>{user}</div>
            </div>
        );
    }
}

export default UserName;
