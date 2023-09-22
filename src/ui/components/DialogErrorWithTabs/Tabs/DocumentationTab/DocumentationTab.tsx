import React from 'react';

import block from 'bem-cn-lite';

import {replaceRelativeLinksToAbsoluteInHTML} from '../../../../utils';
import {YfmWrapper} from '../../../YfmWrapper/YfmWrapper';

import './DocumentationTab.scss';

type Props = {
    documentation: string | null;
};

const b = block('documentation-tab');

// To lift styles and listeners from the docks, use a class on a container with markup

const DocumentationTab: React.FC<Props> = ({documentation}: Props) => {
    if (!documentation) {
        return null;
    }

    return (
        <YfmWrapper
            className={b()}
            setByInnerHtml={true}
            content={replaceRelativeLinksToAbsoluteInHTML(documentation)}
            noMagicLinks={true}
        />
    );
};

export default DocumentationTab;
