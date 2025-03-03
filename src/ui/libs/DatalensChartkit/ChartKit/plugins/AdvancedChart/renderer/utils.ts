function isTouchEnabled() {
    if (typeof window !== 'object') {
        return false;
    }

    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export const IS_TOUCH_ENABLED = isTouchEnabled();
