import React from 'react';

export const useHover = () => {
    const [isHovered, setHovered] = React.useState<boolean>(false);

    const eventHandlers = React.useMemo(
        () => ({
            onMouseOver() {
                setHovered(true);
            },
            onMouseOut() {
                setHovered(false);
            },
        }),
        [],
    );

    return {isHovered, eventHandlers};
};
