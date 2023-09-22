import React from 'react';

import {Checkbox} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {SectionWrapper} from '../../../../../../components/SectionWrapper/SectionWrapper';

import {Row} from './Row';
import {Title} from './Title';

import '../Settings.scss';

const b = block('dialog-settings');
const i18n = I18n.keyset('dash.settings-dialog.edit');

type DisplayProps = {
    hideTabsValue: boolean;
    onChangeHideTabs: () => void;
    hideDashTitleValue: boolean;
    onChangeHideDashTitle: () => void;
    expandTOCValue: boolean;
    onChangeExpandTOC: () => void;
};

export const Display = ({
    hideTabsValue,
    onChangeHideTabs,
    hideDashTitleValue,
    onChangeHideDashTitle,
    expandTOCValue,
    onChangeExpandTOC,
}: DisplayProps) => {
    return (
        <SectionWrapper
            title={i18n('label_display')}
            titleMods={b('section-title')}
            subTitle={i18n('label_display-info')}
        >
            <Row>
                <Title text={i18n('label_title')} />
                <Checkbox
                    size="l"
                    checked={!hideDashTitleValue}
                    onChange={onChangeHideDashTitle}
                    className={b('box')}
                />
            </Row>
            <Row>
                <Title text={i18n('label_tabs')} />
                <Checkbox
                    size="l"
                    checked={!hideTabsValue}
                    onChange={onChangeHideTabs}
                    className={b('box')}
                />
            </Row>
            <Row>
                <Title text={i18n('label_toc')} />
                <Checkbox
                    size="l"
                    qa="settings-dialog-switch-toc"
                    checked={expandTOCValue}
                    onChange={onChangeExpandTOC}
                    className={b('box')}
                />
            </Row>
        </SectionWrapper>
    );
};
