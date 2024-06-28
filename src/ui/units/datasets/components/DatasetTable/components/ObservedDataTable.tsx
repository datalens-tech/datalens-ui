import React from 'react';

import DataTable from '@gravity-ui/react-data-table';

// DataTable is used in SplitPane for it to calculate column
// accordingly to it's container we need to trigger resize events
// not only on window resize but when SplitPane size changed by user actions
export class ObservedTableResizer<T> extends DataTable<T> {
    _wrapperRef: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();
    _resizeObserver?: ResizeObserver;

    componentDidMount() {
        super.componentDidMount?.();

        if (this._wrapperRef.current) {
            this._resizeObserver = new ResizeObserver(() => {
                this.resize();
            });
            this._resizeObserver.observe(this._wrapperRef.current);
        }
    }

    componentWillUnmount(): void {
        super.componentWillUnmount?.();

        if (this._resizeObserver) {
            this._resizeObserver?.disconnect();
            delete this._resizeObserver;
        }
    }

    render() {
        return <div ref={this._wrapperRef}>{super.render()}</div>;
    }
}
