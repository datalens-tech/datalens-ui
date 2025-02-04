import React from 'react';

import {ChevronsDown, Xmark} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {DashRevisions} from 'shared';

import {setRevisionsListMode} from '../../store/actions/entryContent';
import {selectIsRevisionsListCollapsed} from '../../store/selectors/entryContent';
import {RevisionsListMode} from '../../store/typings/entryContent';

import './ExpandablePanel.scss';

const b = block('expandable-panel');

const i18n = I18n.keyset('component.expandable-panel.view');

type ExpandablePanelProps = {
    active: boolean;
    title: string;
    onClose: () => void;
    description?: string;
    className?: string;
};

const ExpandablePanel: React.FC<ExpandablePanelProps> = ({
    title,
    active,
    onClose,
    children,
    description,
    className,
}) => {
    const dispatch = useDispatch();

    const isCollapsed = useSelector(selectIsRevisionsListCollapsed);
    const handlerChangeCollapse = React.useCallback(
        (collapse: boolean) => {
            const mode = collapse ? RevisionsListMode.Collapsed : RevisionsListMode.Expanded;
            dispatch(setRevisionsListMode(mode));
        },
        [dispatch],
    );

    if (!active) {
        return null;
    }

    return (
        <div className={b({collapsed: isCollapsed}, className)} data-qa="expandable-panel">
            <div className={b('container')}>
                <div className={b('header')}>
                    <div className={b('title')}>
                        <span className={b('title-text')}>{title}</span>
                        <Button
                            className={b('arrow', {expanded: !isCollapsed})}
                            qa={
                                isCollapsed
                                    ? DashRevisions.EXPANDABLE_PANEL_COLLAPSED_BTN
                                    : DashRevisions.EXPANDABLE_PANEL_EXPANDED_BTN
                            }
                            size="s"
                            view="flat"
                            title={
                                isCollapsed
                                    ? i18n('button_title-expand')
                                    : i18n('button_title-collapse')
                            }
                            onClick={() => handlerChangeCollapse(!isCollapsed)}
                        >
                            <Icon data={ChevronsDown} width="14" height="14" />
                        </Button>
                        <Button
                            className={b('close')}
                            size="s"
                            view="flat"
                            onClick={onClose}
                            qa="expandable-panel-close"
                        >
                            <Icon data={Xmark} width="14" height="14" />
                        </Button>
                    </div>
                    {description && !isCollapsed && (
                        <div className={b('description')}>{description}</div>
                    )}
                </div>
                {!isCollapsed && <div className={b('shadow-putty')} />}
                <div className={b('content')}>{children}</div>
            </div>
        </div>
    );
};

export default ExpandablePanel;
