import React from 'react';

import {Dialog, Select, TextArea, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import './CollectionDialog.scss';
import Utils from 'ui/utils';

const i18n = I18n.keyset('component.collections-structure');

const b = block('dl-collection-dialog');

export type Props = {
    title: string;
    textButtonApply: string;
    open: boolean;
    isLoading: boolean;
    titleValue?: string;
    descriptionValue?: string;
    projectValue?: string;
    titleAutoFocus?: boolean;
    onApply: (args: {title: string; project?: string; description: string}) => Promise<unknown>;
    onClose: () => void;
};

export const CollectionDialog = React.memo<Props>(
    ({
        title,
        textButtonApply,
        open,
        isLoading,
        titleValue = '',
        descriptionValue = '',
        projectValue = '',
        titleAutoFocus = false,
        onApply,
        onClose,
    }) => {
        const [innerTitleValue, setInnerTitleValue] = React.useState(titleValue);
        const [innerProjectValue, setInnerProjectValue] = React.useState([projectValue]);
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
            onApply({title: innerTitleValue, project: innerProjectValue[0], description: innerDescriptionValue}).then(() => {
                onClose();
            });
        }, [innerTitleValue, innerProjectValue, innerDescriptionValue, onApply, onClose]);

        return (
            <Dialog
                className={b()}
                size="s"
                open={open}
                onClose={onClose}
                onEnterKeyDown={handleApply}
            >
                <Dialog.Header caption={title} />
                <Dialog.Body>
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
                    <div className={b('field')}>
                        <div className={b('title')}>{i18n('label_description')}</div>
                        <TextArea
                            value={innerDescriptionValue}
                            onUpdate={setInnerDescriptionValue}
                            minRows={2}
                        />
                    </div>
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={onClose}
                    onClickButtonApply={handleApply}
                    textButtonApply={textButtonApply}
                    propsButtonApply={{
                        disabled: !innerTitleValue,
                    }}
                    textButtonCancel={i18n('action_cancel')}
                    loading={isLoading}
                />
            </Dialog>
        );
    },
);

CollectionDialog.displayName = 'CollectionDialog';
