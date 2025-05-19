import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

import {MOCKED_GALLERY_ITEMS} from '../components/pages/mocks';
import type {GalleryItem} from '../types';

export const galleryApi = createApi({
    reducerPath: 'galleryApi',
    baseQuery: fetchBaseQuery({baseUrl: '/'}),
    endpoints: (builder) => ({
        getGalleryItems: builder.query<GalleryItem[], {}>({
            async queryFn() {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({
                            data: MOCKED_GALLERY_ITEMS,
                        });
                    }, 500);
                });
            },
        }),
    }),
});

export const {useGetGalleryItemsQuery} = galleryApi;
