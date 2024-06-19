import React, {useEffect} from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import PropTypes from 'prop-types';

import {EditorPageQA} from '../../../../../../../shared/constants/qa/editor';
import {EVENT_DRAW_PREVIEW} from '../../constants/common';

const b = block('btn-draw-preview');
const keyEnter = 'Enter';

function ButtonDrawPreview({onDrawPreview, className, disabled}) {
    useEffect(() => {
        function keydownHandler(event) {
            if (event.key === keyEnter && (event.ctrlKey || event.metaKey)) {
                onDrawPreview();
            }
        }
        function customKeydownHandler() {
            onDrawPreview();
        }
        window.document.addEventListener('keydown', keydownHandler);
        window.addEventListener(EVENT_DRAW_PREVIEW, customKeydownHandler);
        return () => {
            window.document.removeEventListener('keydown', keydownHandler);
            window.removeEventListener(EVENT_DRAW_PREVIEW, customKeydownHandler);
        };
    }, [onDrawPreview]);

    return (
        <Button
            className={b(false, className)}
            view="outlined"
            size="m"
            onClick={() => onDrawPreview()}
            disabled={disabled}
            qa={EditorPageQA.RunButton}
        >
            {i18n('editor.common.view', 'button_show-preview')}
        </Button>
    );
}

ButtonDrawPreview.propTypes = {
    onDrawPreview: PropTypes.func.isRequired,
    className: PropTypes.string,
    disabled: PropTypes.bool.isRequired,
};

export default ButtonDrawPreview;
