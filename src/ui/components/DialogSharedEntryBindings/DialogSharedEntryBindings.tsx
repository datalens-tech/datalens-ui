import React from 'react';

import {Button, Dialog, SegmentedRadioGroup as RadioButton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {CollectionItemEntities} from 'shared';
import type {GetEntryResponse} from 'shared/schema';
import type {EntryDialogProps} from 'ui';
import {EntryDialogResolveStatus} from 'ui';

import {EntitiesList} from '../EntitiesList/EntitiesList';
import {PlaceholderIllustration} from '../PlaceholderIllustration/PlaceholderIllustration';
import {SharedBindingsList} from '../SharedBindingsList/SharedBindingsList';

import type {AttachmentValue} from './constants';
import {Attachment, ObjectsListTitles} from './constants';
import type {mock} from './mock';
import {getEntityBindings} from './mock';

import './DialogSharedEntryBindings.scss';

type DialogSharedEntryBindingsProps = EntryDialogProps & {
    entry: GetEntryResponse;
};

const sortEntities = (entities: (typeof mock)['items']): (typeof mock)['items'] => {
    return entities.sort((entity) => (entity.entity === CollectionItemEntities.WORKBOOK ? -1 : 1));
};

const b = block('dialog-shared-entries-binding');

export const DialogSharedEntryBindings: React.FC<DialogSharedEntryBindingsProps> = ({
    onClose,
    visible,
    entry,
}) => {
    const [currentDirection, setCurrentDirection] = React.useState<AttachmentValue>(
        Attachment.TARGET,
    );
    const [entities, setEntities] = React.useState<(typeof mock)['items']>([]);

    const [searchFilter, setSearchFilter] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(true);
    const [isError, setIsError] = React.useState(false);

    const showDirectionControl = entry.scope === 'dataset';

    const handleClose = () => {
        onClose({status: EntryDialogResolveStatus.Close});
    };

    const handleDirectionChange = (value: AttachmentValue) => {
        setCurrentDirection(value);
    };

    const fetchEntityBindings = React.useCallback(() => {
        setIsLoading(true);
        setIsError(false);
        // cancelConcurrentRequest();
        getEntityBindings(entry.entryId, currentDirection, searchFilter)
            .then((response) => {
                setEntities(sortEntities(response.items));
                setIsLoading(false);
            })
            .catch((error) => {
                if (error.isCancelled) {
                    return;
                }
                setIsError(true);
                setIsLoading(false);
            });
    }, [entry, currentDirection, searchFilter]);

    React.useEffect(() => {
        fetchEntityBindings();
    }, [fetchEntityBindings]);

    const renderRelations = () => {
        if (isError) {
            const renderRetryAction = () => (
                <Button className={b('button-retry')} size="l" view="action" onClick={() => {}}>
                    Попробовать снова
                </Button>
            );

            return (
                <div className={b('error-state')}>
                    <PlaceholderIllustration
                        direction="column"
                        name="error"
                        title="Произошла ошибка"
                        renderAction={renderRetryAction}
                    />
                </div>
            );
        }

        return (
            <SharedBindingsList
                entities={entities}
                searchProps={{
                    onSearch: setSearchFilter,
                    placeholder: 'Name',
                    disabled: isLoading || isError,
                }}
                title={showDirectionControl ? ObjectsListTitles[currentDirection] : undefined}
                isLoading={isLoading}
            />
        );
    };

    return (
        // TODO texts in CHARTS-11999
        <Dialog open={visible} onClose={handleClose} className={b()}>
            <Dialog.Header caption="Управление привязками" />
            <Dialog.Body className={b('body')}>
                <EntitiesList
                    isCurrent={true}
                    enableHover={true}
                    entities={[entry]}
                    title="Выбранный объект"
                    className={b('current-row', {divider: !showDirectionControl})}
                />

                {showDirectionControl && (
                    <RadioButton
                        className={b('direction')}
                        value={currentDirection}
                        onUpdate={handleDirectionChange}
                        width="auto"
                    >
                        <RadioButton.Option value={Attachment.TARGET}>
                            Используется в воркбуках
                        </RadioButton.Option>
                        <RadioButton.Option value={Attachment.SOURCE}>
                            Содержит подключения
                        </RadioButton.Option>
                    </RadioButton>
                )}
                {renderRelations()}
            </Dialog.Body>
        </Dialog>
    );
};
