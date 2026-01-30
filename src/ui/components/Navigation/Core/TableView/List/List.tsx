import React from 'react';

import block from 'bem-cn-lite';
import AutoSizer from 'react-virtualized-auto-sizer';
import type {VariableSizeListProps} from 'react-window';
import {VariableSizeList} from 'react-window';
import {DlNavigationQA} from 'shared';

import type {NavigationEntry} from '../../../../../../shared/schema';
import {Row, RowLoaderMore} from '../Row/Row';
import {RowHeader} from '../Row/RowHeader';
import type {HookBatchSelectResult, TableViewProps} from '../types';

const b = block('dl-core-navigation-table-view');
const ROW_HEIGHT = 40;

type GenericListProps = VariableSizeListProps<NavigationEntry>;

export type ListProps = Omit<HookBatchSelectResult, 'resetSelected'> &
    Omit<TableViewProps, 'isMobileNavigation'> & {
        showBatchPanel: boolean;
    };

type InnerElementTypeContextStore = Pick<
    TableViewProps,
    'mode' | 'displayParentFolder' | 'isOnlyCollectionsMode'
> &
    Pick<
        HookBatchSelectResult,
        'isAllCheckBoxChecked' | 'onAllCheckBoxSelect' | 'isBatchEnabled'
    > & {
        showBatchPanel: boolean;
    };

const InnerElementTypeContext = React.createContext<InnerElementTypeContextStore>({
    mode: 'full',
    isBatchEnabled: false,
    showBatchPanel: false,
    displayParentFolder: false,
    isAllCheckBoxChecked: false,
    onAllCheckBoxSelect: () => {},
    isOnlyCollectionsMode: false,
});

const InnerElementType = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
    function InnerElementType({children, ...rest}, ref) {
        const {
            showBatchPanel,
            mode,
            isBatchEnabled,
            isOnlyCollectionsMode,
            displayParentFolder,
            isAllCheckBoxChecked,
            onAllCheckBoxSelect,
        } = React.useContext(InnerElementTypeContext);
        return (
            <div ref={ref} className={b('list', {showBatchPanel})} {...rest}>
                {isBatchEnabled && (
                    <RowHeader
                        mode={mode}
                        displayParentFolder={displayParentFolder}
                        isAllCheckBoxChecked={isAllCheckBoxChecked}
                        onAllCheckBoxSelect={onAllCheckBoxSelect}
                        isOnlyCollectionsMode={isOnlyCollectionsMode}
                    />
                )}
                {children}
            </div>
        );
    },
);

export class List extends React.PureComponent<ListProps> {
    private listRef = React.createRef<VariableSizeList>();

    componentDidUpdate(prevProps: ListProps) {
        const shouldListUpdate = !(
            prevProps.loading === this.props.loading &&
            prevProps.currentEntryContext === this.props.currentEntryContext &&
            prevProps.selectedIds === this.props.selectedIds &&
            prevProps.entries === this.props.entries
        );
        if (shouldListUpdate && this.listRef.current) {
            this.listRef.current.forceUpdate();
        }
    }

    render() {
        const {
            hasNextPage,
            entries,
            showBatchPanel,
            mode,
            displayParentFolder,
            isAllCheckBoxChecked,
            onAllCheckBoxSelect,
            isBatchEnabled,
            isOnlyCollectionsMode,
        } = this.props;
        const entriesLength = entries.length;
        const itemCount =
            (hasNextPage ? entriesLength + 1 : entriesLength) + this.getHeaderItemsCount();

        return (
            <InnerElementTypeContext.Provider
                value={{
                    showBatchPanel,
                    mode,
                    displayParentFolder,
                    isAllCheckBoxChecked,
                    onAllCheckBoxSelect,
                    isBatchEnabled,
                    isOnlyCollectionsMode,
                }}
            >
                <AutoSizer>
                    {({width, height}: {width: number; height: number}) => (
                        <VariableSizeList
                            ref={this.listRef}
                            innerElementType={InnerElementType}
                            width={width}
                            height={height}
                            overscanCount={10}
                            itemCount={itemCount}
                            itemSize={this.getRowHeight}
                            onScroll={this.onScroll}
                            onItemsRendered={this.onItemsRendered}
                        >
                            {this.rowRenderer}
                        </VariableSizeList>
                    )}
                </AutoSizer>
            </InnerElementTypeContext.Provider>
        );
    }

    private onScroll = () => {
        if (this.props.currentEntryContext) {
            this.props.onCloseEntryContextMenu();
        }
    };

    private rowRenderer: GenericListProps['children'] = ({index, style}) => {
        const {hasNextPage, entries, isBatchEnabled} = this.props;
        if (isBatchEnabled && index === 0) {
            return null;
        }

        const entryIndex = index - this.getHeaderItemsCount();
        const isLastRow = entries.length === entryIndex;
        const entry = entries[entryIndex];

        return (
            <div style={style} className={b('row-container')} data-qa={DlNavigationQA.List}>
                {hasNextPage && isLastRow ? (
                    <RowLoaderMore />
                ) : (
                    <Row
                        mode={this.props.mode}
                        place={this.props.place}
                        displayParentFolder={this.props.displayParentFolder}
                        onEntryContextClick={this.props.onEntryContextClick}
                        onChangeFavorite={this.props.onChangeFavorite}
                        currentEntryContext={this.props.currentEntryContext}
                        currentPageEntry={this.props.currentPageEntry}
                        clickableScope={this.props.clickableScope}
                        inactiveEntryKeys={this.props.inactiveEntryKeys}
                        inactiveEntryIds={this.props.inactiveEntryIds}
                        checkEntryActivity={this.props.checkEntryActivity}
                        onEntryClick={this.props.onEntryClick}
                        onEntryParentClick={this.props.onEntryParentClick}
                        linkWrapper={this.props.linkWrapper}
                        selectedIds={this.props.selectedIds}
                        onEntrySelect={this.props.onEntrySelect}
                        isBatchEnabled={this.props.isBatchEnabled}
                        entry={entry}
                        onMenuClick={this.props.onMenuClick}
                        isOnlyCollectionsMode={this.props.isOnlyCollectionsMode}
                        index={index - 1}
                    />
                )}
            </div>
        );
    };

    private getRowHeight: GenericListProps['itemSize'] = () => {
        return ROW_HEIGHT;
    };

    private onItemsRendered: GenericListProps['onItemsRendered'] = ({visibleStopIndex}) => {
        const {hasNextPage, entries, loading} = this.props;
        if (
            !loading &&
            hasNextPage &&
            entries.length + this.getHeaderItemsCount() === visibleStopIndex
        ) {
            this.props.onLoadMore();
        }
    };

    private getHeaderItemsCount() {
        return this.props.isBatchEnabled ? 1 : 0;
    }
}
