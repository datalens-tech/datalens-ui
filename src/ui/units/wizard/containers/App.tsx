import React from 'react';

import block from 'bem-cn-lite';
import {useHotkeysContext} from 'react-hotkeys-hook';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import type {DatalensGlobalState} from '../../..';
import {getIsAsideHeaderEnabled} from '../../../components/AsideHeaderAdapter';
import {HOTKEYS_SCOPES} from '../../../constants/misc';
import withInaccessibleOnMobile from '../../../hoc/withInaccessibleOnMobile';
import {useAutodetectHotkeysScope} from '../../../hooks/useAutodetectHotkeysScope';
import {setCurrentPageEntry} from '../../../store/actions/asideHeader';
import {selectWidget} from '../selectors/widget';

import Wizard from './Wizard/Wizard';

import './App.scss';

const b = block('wizard-app');

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
interface Props extends StateProps, DispatchProps {}

const App = ({widget, setCurrentPageEntry, asideHeaderData, ...routeProps}: Props) => {
    const isAsideHeaderEnabled = getIsAsideHeaderEnabled();

    const hotkeysContext = useHotkeysContext();

    useAutodetectHotkeysScope({
        hotkeysContext,
        scope: HOTKEYS_SCOPES.WIZARD,
    });

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
