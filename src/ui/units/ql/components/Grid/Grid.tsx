import React from 'react';

import ViewLoader from 'components/ViewLoader/ViewLoader';
import debounce from 'lodash/debounce';
import {connect} from 'react-redux';
import SplitPane from 'react-split-pane';
import type {DatalensGlobalState, EntryDialogues} from 'ui';
import {SPLIT_PANE_RESIZER_CLASSNAME} from 'ui';

import {getCurrentSchemeId, getGridPanesIds, getGridSchemes} from '../../store/reducers/ql';
import type {QLGridScheme, QLGridSchemes} from '../../store/typings/ql';

import GridPane from './GridPane/GridPane';

import './Grid.scss';

const splitPaneStyle = {
    overflow: 'visible',
};

interface RenderGridSchemeProps {
    scheme: QLGridScheme[];
    gridSchemes: object;
    ids: string[];
    paneSize: number;
    onChange: (size: number) => void;
    schemeId: string;
    entryDialoguesRef: React.RefObject<EntryDialogues>;
}

function renderGridScheme({
    scheme,
    ids,
    paneSize,
    onChange,
    schemeId,
    entryDialoguesRef,
    gridSchemes,
}: RenderGridSchemeProps): JSX.Element[] {
    return scheme.map((child, i) => {
        const {name, childNodes, props: splitPaneProps, index} = child;
        return name === 'child' && typeof index === 'number' ? (
            <React.Fragment key={`grid-element-${i}`}>
                {splitPaneProps?.loader && (
                    <div className="grid-loader">
                        <ViewLoader size="l" />
                    </div>
                )}
                <GridPane
                    id={ids[index]}
                    key={`${schemeId}_${i}`}
                    paneSize={paneSize}
                    entryDialoguesRef={entryDialoguesRef}
                />
            </React.Fragment>
        ) : (
            <React.Fragment key={`grid-element-${i}`}>
                {splitPaneProps?.loader && (
                    <div className="grid-loader">
                        <ViewLoader size="m" />
                    </div>
                )}
                <SplitPane
                    resizerClassName={SPLIT_PANE_RESIZER_CLASSNAME}
                    {...splitPaneProps}
                    key={`${schemeId}_${i}`}
                    onChange={onChange}
                    style={splitPaneStyle}
                >
                    {typeof childNodes !== 'undefined' &&
                        renderGridScheme({
                            scheme: childNodes,
                            ids,
                            paneSize,
                            onChange,
                            schemeId,
                            entryDialoguesRef,
                            gridSchemes,
                        })}
                </SplitPane>
            </React.Fragment>
        );
    });
}

interface GridProps {
    size: number;
    gridSchemes: QLGridSchemes | null;
    schemeId: string;
    panesIds: string[];
    entryDialoguesRef: React.RefObject<EntryDialogues>;
}

interface GridState {
    paneSize: number;
}

class Grid extends React.PureComponent<GridProps, GridState> {
    state: GridState = {
        paneSize: 0,
    };

    private onChange = debounce((size: number) => {
        this.onChangePaneSize(size);
    }, 16);

    componentDidMount() {
        window.addEventListener('resize', this.onResize);
    }

    componentDidUpdate(prevProps: GridProps) {
        const {size} = this.props;

        if (prevProps.size !== size) {
            this.onChange(size);
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize);
    }

    render() {
        const {schemeId, panesIds, entryDialoguesRef, gridSchemes} = this.props;
        const {paneSize} = this.state;

        if (!gridSchemes) {
            return null;
        }

        const {scheme} = gridSchemes.schemes[schemeId];

        return renderGridScheme({
            scheme,
            ids: panesIds,
            paneSize,
            onChange: this.onChange,
            schemeId,
            entryDialoguesRef,
            gridSchemes,
        });
    }

    private onChangePaneSize = (size: number) => {
        this.setState({
            paneSize: size ?? this.props.size,
        });
    };

    private onResize = () => {
        this.onChangePaneSize(window.innerHeight + window.innerWidth);
    };
}

const makeMapStateToProps = (state: DatalensGlobalState) => {
    return {
        schemeId: getCurrentSchemeId(state),
        panesIds: getGridPanesIds(state),
        gridSchemes: getGridSchemes(state),
    };
};

export default connect(makeMapStateToProps, {})(Grid);
