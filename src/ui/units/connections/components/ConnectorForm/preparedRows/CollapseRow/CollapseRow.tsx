import React from 'react';

import block from 'bem-cn-lite';
import {Collapse} from 'components/Collapse/Collapse';
import {get} from 'lodash';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {CollapseRowItem} from 'shared/schema/types';
import type {DatalensGlobalState} from 'ui';
import type {CollapseProps} from 'ui/components/Collapse/types';

import {changeInnerForm} from '../../../../store';

import './CollapseRow.scss';

const b = block('conn-form-collapse');
const COLLAPSE_MODE = {
    OPENED: 'opened',
    CLOSED: 'closed',
};

type DispatchState = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type PlainTextComponentProps = DispatchState & DispatchProps & Omit<CollapseRowItem, 'type'>;

const CollapseRowComponent = (props: PlainTextComponentProps) => {
    const {actions, innerForm, name, text} = props;
    const componentProps = get(props, 'componentProps', {} as Partial<CollapseProps>);
    const defaultIsExpand = get(componentProps, 'defaultIsExpand', false);

    const clickHandler = React.useCallback(() => {
        const currentMode = innerForm[name] || COLLAPSE_MODE.CLOSED;
        const nextMode =
            currentMode === COLLAPSE_MODE.CLOSED ? COLLAPSE_MODE.OPENED : COLLAPSE_MODE.CLOSED;
        actions.changeInnerForm({[name]: nextMode});
    }, [actions, innerForm, name]);

    React.useEffect(() => {
        const initialMode = defaultIsExpand ? COLLAPSE_MODE.OPENED : COLLAPSE_MODE.CLOSED;
        actions.changeInnerForm({[name]: initialMode});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={b()} onClick={clickHandler}>
            <Collapse {...componentProps} className={b('component')} title={text}>
                {/* the div is necessary in order to show the chevron at Collapse*/}
                <div />
            </Collapse>
        </div>
    );
};

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        innerForm: state.connections.innerForm,
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        actions: bindActionCreators(
            {
                changeInnerForm,
            },
            dispatch,
        ),
    };
};

export const CollapseRow = connect(mapStateToProps, mapDispatchToProps)(CollapseRowComponent);
