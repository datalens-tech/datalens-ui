import {DL} from '../../constants';
import type {LandingAction} from 'store/actions/landing';
import {SET_IS_LANDING} from 'store/actions/landing';

export type LandingState = {
    isLanding: boolean;
};

const initialState = {
    isLanding: DL.IS_LANDING,
};

const landing = (state = initialState, action: LandingAction) => {
    switch (action.type) {
        case SET_IS_LANDING: {
            return {
                isLanding: action.isLanding,
            };
        }
        default: {
            return state;
        }
    }
};

export default landing;
