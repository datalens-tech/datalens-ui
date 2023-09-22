import React from 'react';

import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import PropTypes from 'prop-types';
import AutoSizer from 'react-virtualized-auto-sizer';
import {VariableSizeList as List} from 'react-window';

import './PaginationList.scss';

const b = block('pagination-list');

const RowLoaderMore = () => {
    return (
        <div className={b('row-loader-more')}>
            <Loader size="m" />
        </div>
    );
};

export class PaginationList extends React.PureComponent {
    static propTypes = {
        items: PropTypes.array,
        currentItemContext: PropTypes.any,
        onScroll: PropTypes.func,
        loading: PropTypes.bool,
        hasNextPage: PropTypes.bool,
        onLoadMore: PropTypes.func,
        rowHeight: PropTypes.number,
        rowLoaderHeight: PropTypes.number,
        rowRenderer: PropTypes.func.isRequired,
        className: PropTypes.string,
    };

    static defaultProps = {
        rowHeight: 40,
        rowLoaderHeight: 60,
    };

    componentDidUpdate(prevProps) {
        const shouldListUpdate = !(
            prevProps.loading === this.props.loading &&
            prevProps.currentItemContext === this.props.currentItemContext
        );
        if (shouldListUpdate && this.listRef.current) {
            this.refresh();
        }
    }

    listRef = React.createRef();

    refresh() {
        this.listRef.current.forceUpdate();
    }

    rowRenderer = ({index, style}) => {
        const {hasNextPage, items} = this.props;
        const isLastRow = items.length === index;
        const item = items[index];

        return (
            <div style={style}>
                {hasNextPage && isLastRow ? (
                    <RowLoaderMore />
                ) : (
                    this.props.rowRenderer({item, index})
                )}
            </div>
        );
    };

    getRowHeight = ({index}) => {
        if (this.props.hasNextPage) {
            const isLastRow = this.props.items.length === index;
            return isLastRow ? this.props.rowLoaderHeight : this.props.rowHeight;
        } else {
            return this.props.rowHeight;
        }
    };

    // eslint-disable-next-line react/display-name
    innerListType = React.forwardRef((props, ref) => (
        <div ref={ref} className={b('list')} {...props} />
    ));

    onItemsRendered = ({visibleStopIndex}) => {
        const {hasNextPage, items, loading} = this.props;
        if (!loading && hasNextPage && items.length === visibleStopIndex) {
            this.props.onLoadMore();
        }
    };

    render() {
        const {hasNextPage, items, className} = this.props;
        const itemsLength = items.length;
        const itemCount = hasNextPage ? itemsLength + 1 : itemsLength;

        return (
            <div className={b(false, className)}>
                <AutoSizer>
                    {({width, height}) => (
                        <List
                            ref={this.listRef}
                            innerElementType={this.innerListType}
                            width={width}
                            height={height}
                            overscanRowCount={10}
                            itemCount={itemCount}
                            itemSize={this.getRowHeight}
                            itemData={items}
                            onScroll={this.props.onScroll}
                            onItemsRendered={this.onItemsRendered}
                        >
                            {this.rowRenderer}
                        </List>
                    )}
                </AutoSizer>
            </div>
        );
    }
}
