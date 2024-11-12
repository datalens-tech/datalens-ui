import React from 'react';

import type {PopupPlacement} from '@gravity-ui/uikit';
import {List, Loader, Popup} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {DebouncedInput} from 'components/DebouncedInput';
import {EntryIcon} from 'components/EntryIcon/EntryIcon';
import {i18n} from 'i18n';
import {getSdk} from 'libs/schematic-sdk';
import moment from 'moment';
import type {EntryScope} from 'shared';
import {WorkbookNavigationMinimalQa} from 'shared';
import type {GetEntryResponse, GetWorkbookEntriesArgs} from 'shared/schema';
import {DEFAULT_DATE_FORMAT} from 'ui/constants/misc';

import {PlaceholderIllustration} from '../PlaceholderIllustration/PlaceholderIllustration';

import './WorkbookNavigationMinimal.scss';

const b = block('dl-core-workbook-navigation-minimal');

const ROW_HEIGHT = 40;

type Item = {
    entry: GetEntryResponse;
    inactive: boolean;
    qa?: string;
};

type Props = {
    anchor: React.RefObject<any>;
    visible: boolean;
    onClose: (event: MouseEvent | KeyboardEvent) => void;
    onEntryClick: (args: GetEntryResponse) => void;
    hasTail?: boolean;
    popupPlacement?: PopupPlacement;
    workbookId: string;
    scope: EntryScope;
    includeClickableType?: string | string[];
    excludeClickableType?: string | string[];
    inactiveEntryIds?: string[];
};

type State = {
    filter: string;
    items?: Item[];
};

class WorkbookNavigationMinimal extends React.Component<Props, State> {
    static defaultProps = {
        hasTail: false,
        popupPlacement: ['bottom-start'],
    };

    state = {
        filter: '',
        items: undefined,
    };

    componentDidMount() {
        const {visible, workbookId} = this.props;

        if (visible && workbookId) {
            this.fetchWorkbooEntries(true);
        }
    }

    componentDidUpdate(prevProps: Props) {
        const {visible, workbookId} = this.props;
        const becameVisibleOrRecievedWorkbookId =
            (prevProps.visible !== visible && visible) ||
            (prevProps.workbookId !== workbookId && visible);

        if (becameVisibleOrRecievedWorkbookId) {
            this.fetchWorkbooEntries(true);
        }
    }

    onClose = (event: MouseEvent | KeyboardEvent) => {
        if (document.body.contains(event.target as any)) {
            this.props.onClose(event);
        }
    };

    render() {
        const {popupPlacement, anchor, visible, hasTail} = this.props;

        if (!anchor.current) {
            return null;
        }

        const items = this.state.items as undefined | any[];

        return (
            <Popup
                hasArrow={hasTail}
                placement={popupPlacement}
                onClose={this.onClose}
                open={visible}
                anchorRef={anchor}
                contentClassName={b('popup')}
                qa={WorkbookNavigationMinimalQa.Popup}
            >
                {visible && (
                    <div className={b()}>
                        <div className={b('control')}>
                            <DebouncedInput
                                qa={WorkbookNavigationMinimalQa.Input}
                                value={this.state.filter}
                                onUpdate={this.onUpdateFilter}
                                hasClear={true}
                                placeholder={i18n(
                                    'component.workbook.navigation.view',
                                    'label_placeholder-filter-by-name',
                                )}
                            />
                        </div>
                        {!items ? <Loader className={b('loader')} /> : null}
                        {items && !items.length ? (
                            <div className={b('empty-entries')}>
                                <PlaceholderIllustration
                                    name="notFound"
                                    title={i18n(
                                        'component.workbook.navigation.view',
                                        'label_no-data',
                                    )}
                                    size="m"
                                    direction="column"
                                />
                            </div>
                        ) : null}
                        {items && items.length ? (
                            <List
                                qa={WorkbookNavigationMinimalQa.List}
                                items={items}
                                filterable={false}
                                renderItem={this.renderItem}
                                itemHeight={this.getRowHeight}
                                onItemClick={this.onItemClick}
                            />
                        ) : null}
                    </div>
                )}
            </Popup>
        );
    }

    private renderItem = (item: Item) => {
        const {entry, inactive, qa} = item;
        const name = entry.key.split('/').pop();
        const date = moment(entry.createdAt).format(DEFAULT_DATE_FORMAT);

        return (
            <div data-qa={qa} className={b('row', {inactive})}>
                <EntryIcon entry={entry} className={b('icon')} width="24" height="24" />
                <div className={b('info')}>
                    <div className={b('name')}>
                        <div title={name} className={b('name-line')}>
                            <span>{name}</span>
                        </div>
                    </div>

                    <div title={date} className={b('date')}>
                        <span>{date}</span>
                    </div>
                </div>
            </div>
        );
    };

    private fetchWorkbooEntries(reinit = false) {
        this.setState({
            items: undefined,
            filter: reinit ? '' : this.state.filter,
        });

        let filters: GetWorkbookEntriesArgs['filters'];

        if (!reinit && this.state.filter) {
            filters = {
                name: this.state.filter,
            };
        }

        getSdk()
            .us.getWorkbookEntries(
                {workbookId: this.props.workbookId, scope: this.props.scope, filters},
                {concurrentId: 'WorkbookNavigationMinimal/getWorkbookEntries'},
            )
            .then(({entries}) => {
                const {includeClickableType, excludeClickableType, inactiveEntryIds} = this.props;

                const includeType = new Set(
                    Array.isArray(includeClickableType)
                        ? includeClickableType
                        : [includeClickableType],
                );
                const excludeType = new Set(
                    Array.isArray(excludeClickableType)
                        ? excludeClickableType
                        : [excludeClickableType],
                );
                const inactiveIds = new Set(
                    Array.isArray(inactiveEntryIds) ? inactiveEntryIds : [],
                );

                this.setState({
                    items: entries.map((entry) => {
                        const inactiveByIncludeType = includeClickableType
                            ? !includeType.has(entry.type)
                            : false;
                        const inactiveByExcludeType = excludeClickableType
                            ? excludeType.has(entry.entryId)
                            : false;
                        const inactiveByIds = inactiveEntryIds
                            ? inactiveIds.has(entry.entryId)
                            : false;
                        const qa = entry.key.split('/').pop();
                        return {
                            qa,
                            entry,
                            inactive:
                                inactiveByIncludeType || inactiveByExcludeType || inactiveByIds,
                        };
                    }),
                });
            });
    }

    private getRowHeight = () => ROW_HEIGHT;

    private onItemClick = (item: Item) => {
        if (item.inactive) {
            return;
        }
        this.props.onEntryClick(item.entry);
    };

    private onUpdateFilter = (filter: string) =>
        this.setState({filter}, () => this.fetchWorkbooEntries());
}

export default WorkbookNavigationMinimal;
