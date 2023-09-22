import {useEffect} from 'react';

import {i18n} from 'i18n';
import PropTypes from 'prop-types';

function UnloadConfirmation({isScriptsChanged}) {
    useEffect(() => {
        function unloadConfirmation(event) {
            const message = i18n('editor.common.view', 'toast_unsaved');
            if (isScriptsChanged) {
                (event || window.event).returnValue = message;
                return message;
            }
            return null;
        }
        window.addEventListener('beforeunload', unloadConfirmation);
        return () => {
            window.removeEventListener('beforeunload', unloadConfirmation);
        };
    }, [isScriptsChanged]);
    return null;
}

UnloadConfirmation.propTypes = {
    isScriptsChanged: PropTypes.bool,
};

export default UnloadConfirmation;
