import {useEffect} from 'react';

export const useTitle = (title, unmoutTitle) => {
    useEffect(() => {
        document.title = title;
        return () => {
            if (unmoutTitle) {
                document.title = unmoutTitle;
            }
        };
    }, [title, unmoutTitle]);
};
