import {useEffect} from 'react';

export const useTitle = (title?: string, unmoutTitle?: string) => {
    useEffect(() => {
        if (title) {
            document.title = title;
        }
        return () => {
            if (unmoutTitle) {
                document.title = unmoutTitle;
            }
        };
    }, [title, unmoutTitle]);
};
