import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './SearchInput.scss';

const b = block('custom-text-input');

interface Props {
    text: string;
    placeholder?: string;
    onChange: (value: string) => void;
}
class SearchInput extends React.PureComponent<Props> {
    render() {
        const {text, placeholder, onChange} = this.props;

        return (
            <div className={b()}>
                <TextInput
                    type="text"
                    size="m"
                    pin="round-round"
                    value={text}
                    placeholder={placeholder}
                    hasClear={true}
                    onUpdate={onChange}
                    qa="find-field-input"
                />
            </div>
        );
    }
}

export default SearchInput;
