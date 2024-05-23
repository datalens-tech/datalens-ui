import React from 'react';

import {useFileInput} from '@gravity-ui/uikit';

import {useFileContext} from '../context';
import {getAcceptedExtensions} from '../utils';

export const ReplaceSourceButton = () => {
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
    const {controlProps, triggerProps} = useFileInput({onUpdate: handleUpdate});
    const accept = getAcceptedExtensions();

    React.useEffect(() => {
        if (replaceSourceId && showFileSelection) {
            triggerProps.onClick();
            handleReplaceSourceActionData({showFileSelection: false});
        }
    }, [handleReplaceSourceActionData, replaceSourceId, showFileSelection, triggerProps]);

    return <input {...controlProps} accept={accept} multiple={false} />;
};
