import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import type {GalleryItem, GalleryItemShort} from 'shared/types';
import {getSdk} from 'ui/libs/schematic-sdk';

export const galleryApi = createApi({
    reducerPath: 'galleryApi',
    baseQuery: fetchBaseQuery({baseUrl: '/'}),
    endpoints: (builder) => ({
        getGalleryItems: builder.query<GalleryItemShort[], {}>({
            async queryFn() {
                const {entries: data} = await getSdk().sdk.publicGallery.getAllItems();
                return {data};
            },
        }),
        getGalleryItem: builder.query<GalleryItem, {id: string}>({
            async queryFn({id}) {
                const data = await getSdk().sdk.publicGallery.getItem({entryId: id});
                return {data};
            },
        }),
    }),
});

export const {useGetGalleryItemsQuery, useGetGalleryItemQuery} = galleryApi;
