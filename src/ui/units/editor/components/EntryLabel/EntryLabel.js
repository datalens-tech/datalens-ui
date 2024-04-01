import React, {useState} from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import moment from 'moment';
import PropTypes from 'prop-types';

import {TIMESTAMP_FORMAT} from '../../constants/common';
import Revisions from '../../containers/Revisions/Revisions';
import {isEntryLatest} from '../../utils/utils';

import './EntryLabel.scss';

const b = block('entry-label');
const i18n = I18n.keyset('component.entry-label.view');

function EntryLabel({entry}) {
    const [visible, toggleVisible] = useState(false);

    if (!entry || entry.fake) {
        return null;
    }

    function getText() {
        if (isEntryLatest(entry)) {
            return i18n('label_latest');
        }
        return i18n('label_version', {version: moment(entry.updatedAt).format(TIMESTAMP_FORMAT)});
    }

    return (
        <React.Fragment>
            <div className={b()} onClick={() => toggleVisible(true)}>
                <div className={b('text')}>{getText()}</div>
            </div>
            {visible && <Revisions visible={visible} onClose={() => toggleVisible(false)} />}
        </React.Fragment>
    );
}

EntryLabel.propTypes = {
    entry: PropTypes.shape({
        fake: PropTypes.bool,
        savedId: PropTypes.string,
        revId: PropTypes.string,
        updatedAt: PropTypes.string,
    }),
};

export default React.memo(EntryLabel);
