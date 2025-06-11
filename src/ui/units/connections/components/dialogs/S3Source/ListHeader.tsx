import React from 'react';

import {Checkbox} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {ConnectionsS3BaseQA} from 'shared/constants/qa/connections';

const b = block('conn-dialog-s3-source');

type ListHeaderProps = {
    title: string;
    batch?: boolean;
    checked?: boolean;
    indeterminate?: boolean;
    onUpdate: () => void;
};

const ListHeaderComponent = (props: ListHeaderProps) => {
    const {batch, title, checked, indeterminate, onUpdate} = props;

    const handleClick = React.useCallback(() => {
        onUpdate();
    }, [onUpdate]);

    return (
        <div className={b('list-header')}>
            <div className={b('list-header-clickable')} onClick={handleClick}>
                {batch && (
                    <Checkbox
                        size="l"
                        checked={checked}
                        indeterminate={indeterminate}
                        qa={ConnectionsS3BaseQA.S3_SOURCE_DIALOG_BATCH_CHECKBOX}
                    />
                )}
                <span>{title}</span>
            </div>
        </div>
    );
};

export const ListHeader = React.memo(ListHeaderComponent);
