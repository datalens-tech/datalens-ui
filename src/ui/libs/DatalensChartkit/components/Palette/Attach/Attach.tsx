import React from 'react';

import {Button} from '@gravity-ui/uikit';

import {i18n} from '../../../ChartKit/modules/i18n/i18n';

interface AttachProps {
    onChange: () => void;
}

const Attach: React.FC<AttachProps> = ({onChange}) => {
    const inputFile = React.useRef<HTMLInputElement>(null);
    const onButtonClick = () => {
        if (inputFile.current) {
            inputFile.current.click();
        }
    };

    return (
        <div>
            <input
                style={{display: 'none'}}
                id="file"
                type="file"
                ref={inputFile}
                onChange={onChange}
            />
            <Button view="action" size="l" onClick={onButtonClick}>
                {i18n('chartkit', 'label-load-from-file')}
            </Button>
        </div>
    );
};

export default Attach;
