import React from 'react';

import {Dialog, TextArea, TextInput, Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import type {GetDialogFooterPropsOverride} from './types';

import './WorkbookDialog.scss';
import Utils from 'ui/utils';

const i18n = I18n.keyset('component.collections-structure');

const b = block('dl-workbook-dialog');

export type Props = {
    title: string;
    project?: string;
    textButtonApply: string;
    open: boolean;
    isLoading: boolean;
    titleValue?: string;
    projectValue?: string;
    descriptionValue?: string;
    isHiddenDescription?: boolean;
    titleAutoFocus?: boolean;
    onApply: (args: {title: string; project?: string; description?: string; onClose: () => void}) => Promise<unknown>;
    onClose: () => void;
    customActions?: React.ReactNode;
    customBody?: React.ReactNode;
    getDialogFooterPropsOverride?: GetDialogFooterPropsOverride;
};

export const WorkbookDialog = React.memo<Props>(
    ({
        title,
        textButtonApply,
        open,
        isLoading,
        titleValue = '',
        descriptionValue = '',
        projectValue = '',
        isHiddenDescription = false,
        titleAutoFocus = false,
        onApply,
        onClose,
        customActions,
        customBody,
        getDialogFooterPropsOverride,
    }) => {
        const [innerProjectValue, setInnerProjectValue] = React.useState([projectValue]);
        const [innerTitleValue, setInnerTitleValue] = React.useState(titleValue);
        const [innerDescriptionValue, setInnerDescriptionValue] = React.useState(descriptionValue);

        var [projects, setProjects] = React.useState([]);
        var [projectDefault, setProjectDefault] = React.useState("");

        React.useEffect(() => {
            Utils.projects({}).then((values)=>{
                var results: any = [];
                for(var idx in values) {
                    var value = values[idx];
                    var item = {"content": value.name, "value": value.name };
                    results.push(item);

                    if(value.isbase) {
                        setProjectDefault(value.name);
                    }
                }
                setProjects(results);
            })

            if (open) {
                setInnerTitleValue(titleValue);
                setInnerProjectValue([projectValue]);
                setInnerDescriptionValue(descriptionValue);
            }
        }, [open, titleValue, projectValue, descriptionValue]);

        const handleApply = React.useCallback(() => {
            onApply({
                title: innerTitleValue,
                project: innerProjectValue[0],
                description: isHiddenDescription ? undefined : innerDescriptionValue,
                onClose,
            });
        }, [innerTitleValue, innerProjectValue, innerDescriptionValue, isHiddenDescription, onApply, onClose]);

        const dialogFooterProps = React.useMemo(() => {
            const defaultDialogFooterProps = {
                onClickButtonCancel: onClose,
                onClickButtonApply: handleApply,
                textButtonApply: textButtonApply,
                propsButtonApply: {
                    disabled: !innerTitleValue,
                },
                textButtonCancel: i18n('action_cancel'),
                loading: isLoading,
            };
            return getDialogFooterPropsOverride
                ? getDialogFooterPropsOverride(defaultDialogFooterProps)
                : defaultDialogFooterProps;
        }, [
            getDialogFooterPropsOverride,
            handleApply,
            innerTitleValue,
            isLoading,
            onClose,
            textButtonApply,
        ]);

        const renderBody = () => {
            if (customBody) {
                return customBody;
            }

            return (
                <React.Fragment>
                    <div className={b('field')}>
                        <div className={b('title')}>{i18n('label_title')}</div>
                        <TextInput
                            value={innerTitleValue}
                            onUpdate={setInnerTitleValue}
                            autoFocus={titleAutoFocus}
                        />
                    </div>
                    <div className={b('field')}>
                        <div className={b('title')}>{i18n('label_project')}</div>

                        <Select defaultValue={[innerProjectValue[0] || projectDefault]} options={projects} onUpdate={setInnerProjectValue}/>
                    </div>
                    {!isHiddenDescription && (
                        <div className={b('field')}>
                            <div className={b('title')}>{i18n('label_description')}</div>
                            <TextArea
                                value={innerDescriptionValue}
                                onUpdate={setInnerDescriptionValue}
                                minRows={2}
                            />
                        </div>
                    )}
                    {customActions}
                </React.Fragment>
            );
        };

        return (
            <Dialog
                className={b()}
                size="s"
                open={open}
                onClose={onClose}
                onEnterKeyDown={handleApply}
            >
                <Dialog.Header caption={title} />
                <Dialog.Body>{renderBody()}</Dialog.Body>
                <Dialog.Footer {...dialogFooterProps} loading={isLoading} />
            </Dialog>
        );
    },
);

WorkbookDialog.displayName = 'WorkbookDialog';
