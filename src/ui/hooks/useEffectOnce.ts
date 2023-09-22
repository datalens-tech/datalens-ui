import React from 'react';

export function useEffectOnce(effect: React.EffectCallback) {
    React.useEffect(effect, []);
}
