import React from 'react';

import {ArrowUpRightFromSquare, CircleInfo} from '@gravity-ui/icons';
import {Button, DefinitionList, Icon, Popover} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {GetRevisionsEntry} from 'shared/schema';
import {RevisionStatusPoint} from 'ui/components/RevisionStatusPoint/RevisionStatusPoint';
import {URL_QUERY} from 'ui/constants/common';
import {registry} from 'ui/registry';
import {getRevisionStatus, getRevisionStatusKey} from 'ui/utils/revisions';

import './RevisionInfo.scss';

interface RevisionInfoProps {
    className?: string;
    login: string;
    revId?: string;
    revData?: GetRevisionsEntry;
    disabled?: boolean;
}

const b = block('revisions-info');

const i18n = I18n.keyset('component.dialog-revisions-diff.view');

const openNewWindow = (revId?: string) => {
    const url = new URL(window.location.href);
    if (revId) url.searchParams.set(URL_QUERY.REV_ID, revId);
    window.open(url.href, '_blank');
};

export const RevisionInfo: React.FC<RevisionInfoProps> = ({
    login,
    revId,
    revData,
    className,
    disabled = false,
}: RevisionInfoProps) => {
    const onClick = React.useCallback(() => {
        openNewWindow(revId);
    }, [revId]);

    const {getLoginById} = registry.common.functions.getAll();
    const LoginById = getLoginById();

    return (
        <Popover
            openOnHover={false}
            tooltipClassName={b()}
            content={
                <React.Fragment>
                    <Button
                        view="flat-info"
                        size="m"
                        className={b('new-window-btn')}
                        disabled={disabled}
                        onClick={onClick}
                    >
                        {i18n('button_open-revision-in-new-window')}
                        <Icon data={ArrowUpRightFromSquare} size={16} />
                    </Button>
                    <DefinitionList responsive>
                        {revData && (
                            <DefinitionList.Item name={i18n('label_status')}>
                                <RevisionStatusPoint
                                    status={getRevisionStatusKey(revData)}
                                    className={b('status-point')}
                                />
                                {getRevisionStatus(revData)}
                            </DefinitionList.Item>
                        )}
                        {LoginById && (
                            <DefinitionList.Item name={i18n('label_author')}>
                                <LoginById
                                    loginOrId={login}
                                    className={b('staff-user')}
                                    view="secondary"
                                />
                            </DefinitionList.Item>
                        )}
                    </DefinitionList>
                </React.Fragment>
            }
        >
            <Button className={className} view="outlined" size="m" pin="brick-round">
                <Icon data={CircleInfo} size={16} />
            </Button>
        </Popover>
    );
};
