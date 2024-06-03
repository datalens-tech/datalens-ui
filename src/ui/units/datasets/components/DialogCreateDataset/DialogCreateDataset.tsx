import React from 'react';

import {I18n} from '../../../../../i18n';
import type {CreateDatasetResponse} from '../../../../../shared/schema/types';
import type {
    DialogCreateWorkbookEntryProps,
    EntryDialogBaseProps,
} from '../../../../components/EntryDialogues';
import {DialogCreateWorkbookEntry, EntryDialogBase} from '../../../../components/EntryDialogues';
import {URL_QUERY} from '../../../../constants';
import DatasetUtils from '../../helpers/utils';

const i18n = I18n.keyset('dataset.dataset-creation.create');

type DialogCreateDatasetBaseProps = {
    onClose: () => void;
    visible: boolean;
};

type DialogCreateDatasetInNavigationProps = {
    onApply: EntryDialogBaseProps<CreateDatasetResponse>['onApply'];
    creationScope: 'navigation';
};

type DialogCreateDatasetInWorkbookProps = {
    onApply: DialogCreateWorkbookEntryProps<CreateDatasetResponse>['onApply'];
    creationScope: 'workbook';
};

type DialogCreateDatasetProps = DialogCreateDatasetBaseProps &
    (DialogCreateDatasetInNavigationProps | DialogCreateDatasetInWorkbookProps);

const DialogCreateDataset = (props: DialogCreateDatasetProps) => {
    const {visible, onClose} = props;
    const path =
        DatasetUtils.getQueryParam(URL_QUERY.CURRENT_PATH) || DatasetUtils.getPersonalFolderPath();

    if (props.creationScope === 'workbook') {
        return (
            <DialogCreateWorkbookEntry
                name={i18n('label_name-default')}
                defaultName={i18n('label_name-default')}
                caption={i18n('section_title')}
                placeholder={i18n('label_name-placeholder')}
                textButtonApply={i18n('button_apply')}
                textButtonCancel={i18n('button_cancel')}
                visible={visible}
                onApply={props.onApply}
                onClose={onClose}
                onSuccess={onClose}
            />
        );
    }

    return (
        <EntryDialogBase
            name={i18n('label_name-default')}
            defaultName={i18n('label_name-default')}
            path={path}
            caption={i18n('section_title')}
            placeholder={i18n('label_name-placeholder')}
            textButtonApply={i18n('button_apply')}
            textButtonCancel={i18n('button_cancel')}
            visible={visible}
            withInput={true}
            onError={() => null}
            onApply={props.onApply}
            onClose={onClose}
            onSuccess={onClose}
        />
    );
};

export default DialogCreateDataset;
