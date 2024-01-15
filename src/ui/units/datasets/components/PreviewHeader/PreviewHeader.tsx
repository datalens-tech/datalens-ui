import React from 'react';

import {ChevronsExpandUpRight, LayoutHeader, LayoutSideContent, Xmark} from '@gravity-ui/icons';
import {Button, Icon, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import _debounce from 'lodash/debounce';
import {formatNumber} from 'shared/modules/format-units/formatUnit';

import {VIEW_PREVIEW} from '../../constants';

import {ROWS_MAX_COUNT} from './constants';
import {shouldFetchPreview} from './utils';

import './PreviewHeader.scss';

const b = block('preview-header');
const ICON_WIDTH = 24;

interface Props {
    amountPreviewRows: number;
    view: string;
    toggleViewPreview: (args: {view: string}) => void;
    closePreview: () => void;
    changeAmountPreviewRows: (args: {amountPreviewRows: string}) => void;
    refetchPreviewDataset: () => void;
}

class PreviewHeader extends React.Component<Props> {
    static defaultProps = {};

    private debouncedChangeAmountPreviewRows = _debounce(this.props.refetchPreviewDataset, 1000);

    render() {
        const {view, amountPreviewRows} = this.props;

        return (
            <div className={b({view})}>
                <span className={b('label', {bold: true})}>
                    {i18n('dataset.dataset-editor.modify', 'section_preview')}
                </span>
                <div className={b('amount-preview-rows')}>
                    <span>{i18n('dataset.dataset-editor.modify', 'field_display-rows')}</span>
                    <TextInput
                        className={b('amount-preview-rows-inp')}
                        type="number"
                        value={String(amountPreviewRows)}
                        onUpdate={this.changeAmountPreviewRows}
                    />
                    <span className={b('fade-text')}>
                        {i18n('dataset.dataset-editor.modify', 'label_max-amount-rows', {
                            count: formatNumber(ROWS_MAX_COUNT),
                        })}
                    </span>
                </div>
                <div className={b('resize-panel')}>
                    {view !== VIEW_PREVIEW.FULL && (
                        <Button
                            className={b('preview-switcher-btn')}
                            view="flat"
                            title={i18n('dataset.dataset-editor.modify', 'button_preview-full')}
                            onClick={this.togglePreviewFull}
                        >
                            <Icon data={ChevronsExpandUpRight} width={ICON_WIDTH} />
                        </Button>
                    )}
                    {view !== VIEW_PREVIEW.RIGHT && (
                        <Button
                            className={b('preview-switcher-btn', {right: true})}
                            view="flat"
                            title={i18n('dataset.dataset-editor.modify', 'button_preview-right')}
                            onClick={this.togglePreviewRight}
                        >
                            <Icon
                                data={LayoutSideContent}
                                className={b('switcher-icon-right')}
                                width={ICON_WIDTH}
                            />
                        </Button>
                    )}
                    {view !== VIEW_PREVIEW.BOTTOM && (
                        <Button
                            className={b('preview-switcher-btn', {bottom: true})}
                            view="flat"
                            title={i18n('dataset.dataset-editor.modify', 'button_preview-bottom')}
                            onClick={this.togglePreviewBottom}
                        >
                            <Icon
                                data={LayoutHeader}
                                className={b('switcher-icon-bottom')}
                                width={ICON_WIDTH}
                            />
                        </Button>
                    )}
                    <Button
                        className={b('preview-switcher-btn')}
                        view="flat"
                        title={i18n('dataset.dataset-editor.modify', 'button_preview-close')}
                        onClick={this.closePreview}
                    >
                        <Icon data={Xmark} width={ICON_WIDTH} />
                    </Button>
                </div>
            </div>
        );
    }

    changeAmountPreviewRows = (amountPreviewRows: string) => {
        const {changeAmountPreviewRows} = this.props;

        if (this.debouncedChangeAmountPreviewRows) {
            this.debouncedChangeAmountPreviewRows.cancel();
        }

        if (shouldFetchPreview(amountPreviewRows)) {
            this.debouncedChangeAmountPreviewRows();
        }

        changeAmountPreviewRows({amountPreviewRows});
    };

    togglePreviewFull = () => {
        const {toggleViewPreview} = this.props;

        toggleViewPreview({view: VIEW_PREVIEW.FULL});
    };

    togglePreviewBottom = () => {
        const {toggleViewPreview} = this.props;

        toggleViewPreview({view: VIEW_PREVIEW.BOTTOM});
    };

    togglePreviewRight = () => {
        const {toggleViewPreview} = this.props;

        toggleViewPreview({view: VIEW_PREVIEW.RIGHT});
    };

    closePreview = () => {
        const {closePreview} = this.props;

        closePreview();
    };
}

export default PreviewHeader;
