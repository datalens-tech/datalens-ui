import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import type {GetMetaRespose} from 'shared/schema/anonymous-schema/public-gallery/actions';
import type {GalleryItem, GalleryItemShort} from 'shared/types';
import {getSdk} from 'ui/libs/schematic-sdk';

export const galleryApi = createApi({
    reducerPath: 'galleryApi',
    baseQuery: fetchBaseQuery({baseUrl: '/'}),
    endpoints: (builder) => ({
        getGalleryItems: builder.query<GalleryItemShort[], void>({
            async queryFn() {
                const {entries} = await getSdk().sdk.anonymous.publicGallery.getAllItems();
                const data = entries.filter((entry) => !entry.hidden);
                return {data};
            },
        }),
        getGalleryItem: builder.query<GalleryItem, {id: string}>({
            async queryFn({id}) {
                const data = await getSdk().sdk.anonymous.publicGallery.getItem({fileId: id});
                return {data};
            },
        }),
        getGalleryMeta: builder.query<GetMetaRespose, void>({
            async queryFn() {
                const data = await getSdk().sdk.anonymous.publicGallery.getMeta();
                return {data};
            },
        }),
    }),
});

export const {useGetGalleryItemsQuery, useGetGalleryItemQuery, useGetGalleryMetaQuery} = galleryApi;
