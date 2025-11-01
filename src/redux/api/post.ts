import {createApi} from '@reduxjs/toolkit/query/react';
import customBaseQuery from './baseQuery';
import {endpoint} from '../../Constants/endpoints';

export interface Post {
  _id: string;
  imageUrl: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  likes?: string[];
  comments?: any[];
  caption?: string;
}

export interface PostCommentsResponse {
  comments: CommentItem[];
  currentPage: number;
  totalPages: number;
}

export interface CommentItem {
  _id: string;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  text: string;
  createdAt: string;
}

export const postApi = createApi({
  reducerPath: 'postApi',
  baseQuery: customBaseQuery,
  tagTypes: ['Posts', 'PostComments', 'UpdatePostCurrentUser' , 'profilePosts'],
  endpoints: builder => ({
    commentOnPost: builder.mutation<Post, {id: string; comment: string}>({
      query: ({id, comment}) => {
        const url = `${endpoint.post.commentOnPost}${id}`;
        return {
          url,
          method: 'POST',
          data: {comment: comment},
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      invalidatesTags: ['PostComments'],
    }),

    postLike: builder.mutation<Post, {id: string}>({
      query: ({id}) => {
        const url = `${endpoint.post.likePost}${id}`;
        return {
          url,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      invalidatesTags: ['profilePosts'],
    }),

    postDislike: builder.mutation<Post, {id: string}>({
      query: ({id}) => {
        const url = `${endpoint.post.unlikePost}${id}`;
        return {
          url,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      invalidatesTags: ['profilePosts'],
    }),

    deletePost: builder.mutation<Post, {id: string}>({
      query: ({id}) => {
        const url = `${endpoint.post.deletePost}${id}`;
        return {
          url,
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      invalidatesTags: ['Posts'],
    }),

    archivePost: builder.mutation<Post, {id: string}>({
      query: ({id}) => {
        const url = `${endpoint.post.archivePost}${id}`;
        return {
          url,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      invalidatesTags: ['Posts'],
    }),

    unarchivePost: builder.mutation<Post, {id: string}>({
      query: ({id}) => {
        const url = `${endpoint.post.unarchivePost}${id}`;
        return {
          url,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      invalidatesTags: ['Posts'],
    }),

    getArchivedPosts: builder.query<Post[], {page: number}>({
      query: ({page}) => {
        const url = `${endpoint.post.getArchivedPosts}?page=${page}`;
        return {
          url,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      providesTags: ['Posts'],
    }),
    getFeed: builder.query<
      any,
      {
        cursor: string;
        type?: 'post' | 'reel';
        limit?: number;
        refresh?: boolean;
      }
    >({
      query: ({cursor, type, limit = 10, refresh = false}) => {
        //personalized
        // random
        let url = `${endpoint.post.getFeed}?algo=random&refresh=${refresh}&limit=${limit}`;
        if (type) {
          url += `&type=${type}`;
        }
        if (cursor && cursor.length > 0) {
          url += `&cursor=${cursor}`;
        }

        return {
          url,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      providesTags: ['Posts'],
    }),
    getPostComments: builder.query<Post[], {id: string; cursor: string}>({
      query: ({id, cursor}) => {
        let url = `${endpoint.post.getPostComments}${id}`;
        if (cursor && cursor.length > 0) {
          url += `?cursor=${cursor}`;
        }
        return {
          url,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      providesTags: ['PostComments'],
    }),
    getPostById: builder.query<Post, {id: string}>({
      query: ({id}) => {
        return {
          url: endpoint.post.getPostById(id),
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      providesTags: ['Posts'],
    }),

    createPost: builder.mutation<Post, {data: any}>({
      query: ({data}) => {
        const url = `${endpoint.post.create}`;
        return {
          url,
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          data,
        };
      },
      invalidatesTags: ['Posts', 'UpdatePostCurrentUser'],
    }),

    createReel: builder.mutation<Post, {data: any}>({
      query: ({data}) => {
        const url = `${endpoint.post.postReel}`;
        return {
          url,
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          data,
        };
      },
      invalidatesTags: ['Posts', 'UpdatePostCurrentUser'],
    }),
  }),
});

export const {
  useCommentOnPostMutation,
  usePostLikeMutation,
  usePostDislikeMutation,
  useDeletePostMutation,
  useArchivePostMutation,
  useUnarchivePostMutation,
  useGetArchivedPostsQuery,
  useGetFeedQuery,
  useLazyGetFeedQuery,
  useGetPostCommentsQuery,
  useLazyGetPostCommentsQuery,
  useCreatePostMutation,
  useCreateReelMutation,
  useGetPostByIdQuery,
} = postApi;
