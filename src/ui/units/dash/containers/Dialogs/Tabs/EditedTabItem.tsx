import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import {DialogTabsQA} from 'shared/constants/qa';

type EditTabItemProps = {
    onCommit: (text: string) => void;
    id: string;
    title: string;
    className?: string;
};

function EditedTabItem({onCommit, id, title, className}: EditTabItemProps) {
    const [text, setText] = React.useState(title);

    return (
        <div className={className} key={id}>
            <TextInput
                size="m"
                autoFocus
                value={text}
                onUpdate={(newText) => {
                    setText(newText);
                }}
                onKeyDown={(event) => {
                    if (event.keyCode === 36 || event.keyCode === 35) {
                        // Home || End
                        event.stopPropagation();
                    }
                }}
                onBlur={() => onCommit(text)}
                onKeyPress={(event) => event.charCode === 13 && onCommit(text)}
                qa={DialogTabsQA.EditTabItem}
            />
        </div>
    );
}

export default EditedTabItem;
