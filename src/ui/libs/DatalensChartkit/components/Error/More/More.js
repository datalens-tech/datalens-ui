import React from 'react';

import {Xmark} from '@gravity-ui/icons';
import {Button, ClipboardButton, Icon, Modal} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

import './More.scss';

const ANCHOR_NODE_ID = 'chartkit-error-more-anchor';

const INITIATOR_NODE_CLASSNAME = 'chartkit-error-more-initiator';

const b = block('chartkit-error-more');

function onClose() {
    const anchor = document.getElementById(ANCHOR_NODE_ID);
    ReactDOM.unmountComponentAtNode(anchor);

    if (!document.getElementsByClassName(INITIATOR_NODE_CLASSNAME).length) {
        document.body.removeChild(anchor);
    }
}

function onClick({message, requestId, text}) {
    ReactDOM.render(
        <Modal open={true} onClose={onClose}>
            <div className={b('modal')}>
                <div className={b('modal-header')}>
                    <span>{message}</span>
                    <Button view="flat-secondary" size="l" onClick={onClose}>
                        <Icon data={Xmark} size="16" />
                    </Button>
                </div>
                <div className={b('modal-body')}>
                    <div className={b('modal-request-id')}>
                        <span className={b('modal-request-id-title')}>Request-ID:</span>
                        <span className={b('modal-request-id-value')}>{requestId}</span>
                        <ClipboardButton text={requestId} size={14} />
                    </div>
                    <div className={b('text', {modal: true})}>{text}</div>
                </div>
                <div className={b('modal-footer')}>
                    <Button view="outlined" size="l" className={b('button')} onClick={onClose}>
                        {i18n('chartkit.error-details', 'close')}
                    </Button>
                </div>
            </div>
        </Modal>,
        document.getElementById(ANCHOR_NODE_ID),
    );
}

function Error({className, message, requestId, more, opened}) {
    // anchor in body for the case when error was opened and chart was reloaded at same time
    React.useEffect(() => {
        let anchor = document.getElementById(ANCHOR_NODE_ID);

        if (!anchor) {
            anchor = document.createElement('div');
            document.body.appendChild(anchor);
            anchor.setAttribute('id', ANCHOR_NODE_ID);
        }
    }, []);

    let text;
    const values = Object.values(more);

    // for stackTrace
    // if the key is only one and the value is a string, then print without JSON.stringify
    if (values.length === 1 && typeof values[0] === 'string') {
        text = values[0];
    } else {
        text = JSON.stringify(more, null, 2);
    }

    if (opened) {
        return <div className={b('text', className)}>{text}</div>;
    }

    return (
        <Button
            view="outlined"
            className={b('button', `${className} ${INITIATOR_NODE_CLASSNAME}`)}
            onClick={() => onClick({message, requestId, text})}
        >
            {i18n('chartkit.error-details', 'more')}
        </Button>
    );
}

Error.propTypes = {
    more: PropTypes.object.isRequired,
    requestId: PropTypes.string,
    message: PropTypes.string.isRequired,
    className: PropTypes.string,
    opened: PropTypes.bool,
};

export default Error;
