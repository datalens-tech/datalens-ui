import React from 'react';

import block from 'bem-cn-lite';
import {ButtonAttach} from 'components/ButtonAttach/ButtonAttach';

import {useFileContext} from '../context';

const b = block('conn-form-file');

export const ReplaceSourceButton = () => {
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const {
        handleReplaceSource,
        handleReplaceSourceActionData,
        replaceSourceActionData: {replaceSourceId, showFileSelection},
    } = useFileContext();

    const handleUpdate = React.useCallback(
        (files: File[]) => {
            if (replaceSourceId) {
                // There will always be one downloadable file because of {multiple: false}
                handleReplaceSource(files[0], replaceSourceId);
            }
        },
        [handleReplaceSource, replaceSourceId],
    );

    React.useEffect(() => {
        if (replaceSourceId && showFileSelection) {
            // In the UI, the button is hidden (has no height due to lack of content), so to open
            // for the native file selection dialog, the dispatcher clicks on the dom element of the button
            buttonRef.current?.click();
            handleReplaceSourceActionData({showFileSelection: false});
        }
    }, [handleReplaceSourceActionData, replaceSourceId, showFileSelection]);

    return (
        <ButtonAttach
            ref={buttonRef}
            className={b('action-replace')}
            multiple={false}
            onUpdate={handleUpdate}
        />
    );
};
