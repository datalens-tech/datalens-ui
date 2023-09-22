import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {DlNavigationQA} from 'shared';

const b = block('dl-core-navigation-search');

type Props = {
    text: string;
    onChange: (text: string) => void;
    placeholder?: string;
    disabled?: boolean;
};

export default class SearchInput extends React.Component<Props> {
    private refInput = React.createRef<HTMLInputElement>();

    render() {
        const {text, placeholder, onChange, disabled} = this.props;
        return (
            <TextInput
                className={b()}
                qa={DlNavigationQA.SearchInput}
                controlRef={this.refInput}
                hasClear={true}
                placeholder={placeholder}
                value={text}
                onUpdate={onChange}
                disabled={disabled}
            />
        );
    }

    focus() {
        this.refInput.current?.focus();
    }
}
