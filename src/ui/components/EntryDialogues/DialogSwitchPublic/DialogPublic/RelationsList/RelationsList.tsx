import React from 'react';

import {Button, Switch} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {EntryRow} from 'ui/components/EntryRow/EntryRow';

import AlertTooltip from '../AlertTooltip/AlertTooltip';
import type {EntryRelationExtended} from '../types';

import './RelationsList.scss';

const b = block('dl-dialog-public-relations-list');
const i18n = I18n.keyset('component.dialog-switch-public.view');

type GroupScope = 'widget' | 'dataset' | 'connection';

const groupsOrder: GroupScope[] = ['widget', 'dataset', 'connection'];

type RelationGroup = EntryRelationExtended[];

type Props = {
    className?: string;
    progress: boolean;
    onChange: (value: {relations: RelationGroup; nextChecked: boolean}) => {};
    groups: Record<string, RelationGroup>;
};

function RelationsList({className, groups, progress, onChange}: Props) {
    function onChangeTumbler(entry: EntryRelationExtended) {
        if (!progress) {
            onChange({
                relations: [entry],
                nextChecked: !entry.checked,
            });
        }
    }

    function onChangeAll({nextChecked, group}: {nextChecked: boolean; group: RelationGroup}) {
        if (!progress) {
            onChange({
                relations: group.filter((entry) => !entry.disabled),
                nextChecked,
            });
        }
    }

    const renderRightSection = (entry: EntryRelationExtended) => {
        return (
            <div className={b('right-section')}>
                {Boolean(entry.tooltip) && (
                    <AlertTooltip className={b('alert')} text={entry.tooltip} />
                )}
                <Switch
                    size="m"
                    checked={entry.checked}
                    disabled={entry.disabled}
                    onUpdate={() => onChangeTumbler(entry)}
                />
            </div>
        );
    };

    function renderGroup(group: RelationGroup, relationScope: GroupScope) {
        const allDisabled = group.every((entry) => entry.disabled);
        const btnDisabled = progress || allDisabled;
        let nextChecked = !group.filter((entry) => !entry.disabled).every((entry) => entry.checked);
        if (allDisabled) {
            nextChecked = !group.every((entry) => entry.checked);
        }

        const btnText = nextChecked ? i18n('button_enable-all') : i18n('button_disable-all');

        return (
            <div className={b('group')} key={relationScope}>
                <div className={b('group-title')}>
                    <div className={b('group-title-text')}>
                        {i18n(`section_${relationScope}-relations`)}
                    </div>
                    {group.length > 1 && (
                        <Button
                            view="outlined"
                            disabled={btnDisabled}
                            onClick={() => onChangeAll({nextChecked, group})}
                        >
                            {btnText}
                        </Button>
                    )}
                </div>
                {group.map((entry) => (
                    <EntryRow
                        key={entry.entryId}
                        entry={entry}
                        rightSectionSlot={renderRightSection(entry)}
                    />
                ))}
            </div>
        );
    }

    const isGroupsExist = Object.values(groups).some((group) => group.length);

    return (
        <div className={b(null, className)}>
            {isGroupsExist && (
                <div className={b('main-title-text')}>{i18n(`section_object-relations`)}</div>
            )}
            {groupsOrder.map((relationScope) => {
                const group = groups[relationScope];
                return Array.isArray(group) ? renderGroup(group, relationScope) : null;
            })}
        </div>
    );
}

export default RelationsList;
