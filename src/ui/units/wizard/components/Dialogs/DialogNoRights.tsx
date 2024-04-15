import React from 'react';

import {Button, Dialog} from '@gravity-ui/uikit';
import {i18n} from 'i18n';

import './Dialogs.scss';

interface Props {
    visible: boolean;
    onClose: () => void;
    onAccessRights: () => void;
    onSaveAs: () => void;
}

class DialogNoRights extends React.PureComponent<Props> {
    render() {
        return (
            <Dialog open={this.props.visible} onClose={this.props.onClose}>
                <div className="dialog-no-rights">
                    <Dialog.Header caption={i18n('wizard', 'label_no-rights-title')} />
                    <Dialog.Body>
                        <div>{i18n('wizard', 'label_no-rights-text')}</div>
                    </Dialog.Body>
                    <Dialog.Footer preset="default">
                        <Button view="outlined" size="l" onClick={this.props.onAccessRights}>
                            {i18n('wizard', 'button_access-rights')}
                        </Button>
                        <Button view="outlined" size="l" onClick={this.props.onSaveAs}>
                            {i18n('wizard', 'button_save-as')}
                        </Button>
                    </Dialog.Footer>
                </div>
            </Dialog>
        );
    }
}

export default DialogNoRights;
