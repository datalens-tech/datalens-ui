import React from 'react';

import block from 'bem-cn-lite';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import {setCurrentPageEntry} from 'store/actions/asideHeader';
import type {DatalensGlobalState} from 'ui';

import {getIsAsideHeaderEnabled} from '../../../components/AsideHeaderAdapter';
import withInaccessibleOnMobile from '../../../hoc/withInaccessibleOnMobile';
import {selectWidget} from '../selectors/widget';

import Wizard from './Wizard/Wizard';

import './App.scss';

const b = block('wizard-app');

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
interface Props extends StateProps, DispatchProps {}

const App = ({widget, setCurrentPageEntry, asideHeaderData, ...routeProps}: Props) => {
    const isAsideHeaderEnabled = getIsAsideHeaderEnabled();

    React.useEffect(() => {
        return () => {
            setCurrentPageEntry(null);
        };
    }, []);

    const widgetFake = (widget && widget.fake) || false;
    const widgetKey = (widget && widget.key) || '';
    const widgetEntryId = (widget && widget.entryId) || '';

    React.useEffect(() => {
        if (isAsideHeaderEnabled) {
            setCurrentPageEntry(widgetFake ? null : widget);
        }
    }, [widgetFake, widgetKey, widgetEntryId, isAsideHeaderEnabled]);

    return (
        <div className={b()}>
            <div className={b('main', {aside: isAsideHeaderEnabled})}>
                <Wizard
                    {...routeProps}
                    //@ts-ignore
                    asideHeaderSize={asideHeaderData.size}
                />
            </div>
        </div>
    );
};

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        asideHeaderData: state.asideHeader.asideHeaderData,
        widget: selectWidget(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            setCurrentPageEntry,
        },
        dispatch,
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(withInaccessibleOnMobile(App));
