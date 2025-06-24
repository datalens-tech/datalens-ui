import React from 'react';

import {ArrowDownToLine, FileArrowUp} from '@gravity-ui/icons';
import {Button, DropdownMenu, Icon} from '@gravity-ui/uikit';
import type {IconData} from '@gravity-ui/uikit';
import {useHistory} from 'react-router-dom';
import {GalleryCardPageQA} from 'shared/constants/qa';
import {DL} from 'ui/constants';
import {PUBLIC_GALLERY_ID_SEARCH_PARAM} from 'ui/units/collections/components/constants';
import Utils from 'ui/utils';

import {block, galleryCardPageI18n as i18n} from '../../../utils';

import './ImportDropdown.scss';

const b = block('card-import-dropdown');

const getDropdownItem = ({icon, text, hint}: {icon: IconData; text: string; hint?: string}) => {
    return (
        <div className={b('dropdown-item')}>
            <Icon className={b('dropdown-icon')} data={icon} />
            <div className={b('dropdown-text')}>
                {text}
                {hint && <div className={b('dropdown-hint')}>{hint}</div>}
            </div>
        </div>
    );
};

export function ImportDropdown(props: {url: string; entryId: string}) {
    const history = useHistory();

    return (
        <DropdownMenu
            items={[
                {
                    action: () => {
                        Utils.downloadFileByUrl(props.url, `${props.entryId}.json`);
                    },
                    text: getDropdownItem({
                        text: i18n('button_download'),
                        hint: i18n('text_download-desctiption'),
                        icon: ArrowDownToLine,
                    }),
                    qa: GalleryCardPageQA.IMPORT_DROPDOWN_DOWNLOAD_ITEM,
                },
                {
                    action: () => {
                        const redirectUrl = `/collections/?${PUBLIC_GALLERY_ID_SEARCH_PARAM}=${props.entryId}`;

                        if (DL.IS_NOT_AUTHENTICATED) {
                            window.location.href = redirectUrl;
                        } else {
                            history.push(redirectUrl);
                        }
                    },
                    text: getDropdownItem({
                        text: i18n('button_import'),
                        hint: i18n('text_import-desctiption'),
                        icon: FileArrowUp,
                    }),
                    qa: GalleryCardPageQA.IMPORT_DROPDOWN_IMPORT_ITEM,
                },
            ]}
            renderSwitcher={(switcherProps) => (
                <Button {...switcherProps} qa={GalleryCardPageQA.IMPORT_DROPDOWN}>
                    {i18n('button_use')}
                </Button>
            )}
        />
    );
}
