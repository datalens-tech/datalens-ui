import {useEffect, useRef} from 'react';

/** @deprecated use useMountedState */
export const useRefMounted = () => {
    const refMounted = useRef(false);

    useEffect(() => {
        refMounted.current = true;

        return () => {
            refMounted.current = false;
        };
    }, []);

    return refMounted;
};
