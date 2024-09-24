import React, {useState} from 'react';

import {I18n} from 'i18n';
import block from 'bem-cn-lite';

import {DL} from 'ui/constants';
import DialogManager from 'components/DialogManager/DialogManager';
import {AdaptiveDialog} from 'ui/components/AdaptiveDialog/AdaptiveDialog';
import {Button, Select, SelectOption, SelectOptions} from '@gravity-ui/uikit';
import {MOBILE_SIZE} from 'ui/utils/mobile';
import {LowerCasePaperFormat} from 'puppeteer';

import './ExportDialog.scss';
import Utils from 'ui/utils';
import { useDispatch } from 'react-redux';
import { showToast } from 'ui/store/actions/toaster';
const b = block('dialog-export');
const i18n = I18n.keyset('chartkit.menu.export-dialog');

type Props = {
    entryId: string;
    onClose: () => void;
};

export const DIALOG_EXPORT_PDF = Symbol('DIALOG_EXPORT_PDF');

export type OpenDialogExportPdfArgs = {
    id: typeof DIALOG_EXPORT_PDF;
    props: Props;
};

export const ExportDialog: React.FC<Props> = (props) => {
    const [format, setFormat] = useState<LowerCasePaperFormat>('letter');
    const [landscape, setLandscape] = useState<string>("false");

    const [loading, setLoading] = useState<boolean>(false);

    const dispatch = useDispatch();

    const formatOptions = [
        'letter',
        'legal',
        'tabloid',
        'ledger',
        'a0',
        'a1',
        'a2',
        'a3',
        'a4',
        'a5',
        'a6',
    ].map(
        (item: string): SelectOption => ({
            value: item,
            content: item,
            qa: item,
        }),
    );

    const landscapeOptions: SelectOptions = [
        {content: i18n("orientation_portrait"), value: "false"},
        {content: i18n("orientation_landscape"), value: "true"},
    ] 

    const selectSize = DL.IS_MOBILE ? MOBILE_SIZE.SELECT : 'm';

    const {entryId, onClose} = props;

    function onClick () {
        setLoading(true);
        fetch("/print-entry", {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-rpc-authorization': Utils.getRpcAuthorization() 
            },
            body: JSON.stringify({
                "links": [ 
                    entryId
                ],
                "host": window.location.origin,
                "options": {
                    "landscape": landscape == 'true',
                    "format": format
                }
            })
        }).then(res => {
            if (res.status === 200) {
                return res.blob();
            } else {
                return null;
            }
        }).then(blob => {
            if (blob) {
                var url = window.URL.createObjectURL(blob);
                const anchorElement = document.createElement('a');
                document.body.appendChild(anchorElement);
                anchorElement.style.display = 'none';
                anchorElement.href = url;
                anchorElement.download = `${url.split('/').pop()}.pdf`;
                anchorElement.click();
                
                window.URL.revokeObjectURL(url);
                onClose();
            } else {
                dispatch(
                    showToast({
                        title: i18n("orientation_portrait"),
                        error: Error(i18n("error")),
                    }),
                );
            }
        }).finally(()=>{
            setLoading(false);
        });
    }

    return (
        <AdaptiveDialog
            onClose={onClose}
            visible={true}
            title={i18n('export_title')} 
            dialogProps={{className: b()}}
        >
            <div className={b('body')}>
                <Select
                    value={[format]}
                    onUpdate={(value) => setFormat(value[0] as LowerCasePaperFormat)}
                    options={formatOptions}
                    label={i18n('page_format')}
                    size={selectSize}
                />
                <Select
                    value={[landscape]}
                    onUpdate={(value) => setLandscape(value[0])}
                    options={landscapeOptions}
                    label={i18n('page_orientation')}
                    size={selectSize}
                />
                <Button
                    size="xl"
                    width="max"
                    view="action"
                    loading={loading}
                    onClick={onClick}
                >
                    {i18n('export_submit')}
                </Button>
            </div>
        </AdaptiveDialog>
    );
};

DialogManager.registerDialog(DIALOG_EXPORT_PDF, ExportDialog);
