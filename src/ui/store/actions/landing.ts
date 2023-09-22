export const SET_IS_LANDING = Symbol('landing/SET_LANDING');

type SetLandingAction = {
    type: typeof SET_IS_LANDING;
    isLanding: boolean;
};

export const setIsLanding = (isLanding: boolean): SetLandingAction => {
    return {
        type: SET_IS_LANDING,
        isLanding,
    };
};

export type LandingAction = SetLandingAction;
