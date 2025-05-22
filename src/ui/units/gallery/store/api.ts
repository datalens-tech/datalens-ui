import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import type {GalleryItem} from 'shared/types';

import {MOCKED_GALLERY_ITEMS} from '../components/pages/mocks';

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
        getGalleryItem: builder.query<GalleryItem, {id: string}>({
            async queryFn({id}) {
                return new Promise((resolve, reject) => {
                    const data = MOCKED_GALLERY_ITEMS.find((item) => item.id === id);

                    setTimeout(() => {
                        if (data) {
                            resolve({
                                data,
                            });
                        } else {
                            reject({message: 'Item not found', code: 'NOT_FOUND', status: 404});
                        }
                    }, 500);
                });
            },
        }),
    }),
});

export const {useGetGalleryItemsQuery, useGetGalleryItemQuery} = galleryApi;
