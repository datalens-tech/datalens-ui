import React from 'react';

import {Ellipsis} from '@gravity-ui/icons';
import type {DropdownMenuItemMixed} from '@gravity-ui/uikit';
import {Button, DropdownMenu, Icon, Popover} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {SectionDatasetQA} from 'shared';
import type {DataLensApiError} from 'ui';
import {openDialogErrorWithTabs} from 'ui/store/actions/dialog';

import iconError from 'ui/assets/icons/error.svg';

import './DatasetSelectItem.scss';

const i18n = I18n.keyset('wizard');

interface DatasetSelectItemProps {
    icon: React.ReactNode;
    label?: string;
    description?: string;
    items?: DropdownMenuItemMixed<any>[];
    onClick?: (value: any) => void;
    secondary?: boolean;
    selected?: boolean;
    qaRole?: string;
    error?: DataLensApiError;
}

const b = block('dataset-select-item');

const CurrentItemContent: React.FC<DatasetSelectItemProps> = (props) => {
    return (
        <div
            className={b('content')}
            onClick={props.onClick}
            title={`${props.label} ${props.description}`}
            data-qa={props.qaRole}
        >
            {props.icon}
            <div className={b('label')}>{props.label}</div>
            <div className={b('description')} data-qa="current-dataset">
                {props.description}
            </div>
        </div>
    );
};

const SecondaryItemContent: React.FC<DatasetSelectItemProps> = (props) => {
    return (
        <div className={b('content')} onClick={props.onClick} data-qa={props.qaRole}>
            {props.icon}
            <div className={b('label')} title={props.label}>
                {props.label}
            </div>
        </div>
    );
};

const ErrorIcon: React.FC<DatasetSelectItemProps> = (props) => {
    const dispatch = useDispatch();

    const handleClickDetails = React.useCallback(() => {
        dispatch(
            openDialogErrorWithTabs({
                error: props.error as DataLensApiError,
            }),
        );
    }, [dispatch, props.error]);

    return (
        <Popover
            content={i18n('tooltip_dataset-fetch-failed')}
            tooltipActionButton={{
                text: i18n('tooltip_dataset-fetch-failed-details-label'),
                onClick: handleClickDetails,
            }}
        >
            <Icon
                qa="dataset-error-icon"
                className={b('icon')}
                data={iconError}
                width="20"
                height="20"
            />
        </Popover>
    );
};

const DatasetSelectItem: React.FC<DatasetSelectItemProps> = (props) => {
    return (
        <div
            className={b({
                secondary: props.secondary,
                primary: !props.secondary,
                selected: props.selected,
                error: Boolean(props.error),
            })}
            data-qa="dataset-select-item"
        >
            {props.secondary ? (
                <SecondaryItemContent {...props} />
            ) : (
                <CurrentItemContent {...props} />
            )}
            {props.error && <ErrorIcon {...props} />}
            {props.items ? (
                <div className={b('more')}>
                    <DropdownMenu
                        size="s"
                        popupProps={{
                            qa: SectionDatasetQA.DatasetSelectMoreMenu,
                        }}
                        renderSwitcher={() => (
                            <Button view="flat-secondary" qa={SectionDatasetQA.DatasetSelectMore}>
                                <Icon data={Ellipsis} size={16} />
                            </Button>
                        )}
                        items={props.items}
                    />
                </div>
            ) : null}
        </div>
    );
};

export default DatasetSelectItem;
