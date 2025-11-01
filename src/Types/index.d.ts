// Define interface for SendPost ref
interface SendPostRef {
  open: (postId: string) => void;
  close: () => void;
}

interface Post {
  _id: string;
  id: string;
  userId: string;
  imageUrl: string;
  caption: string;
  privacy: 'public' | 'private';
  likes: string[];
  isArchived: boolean;
  comments: {
    _id: string;
    userId: string;
    text: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
  user: {
    username: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
  };
  isLiked?: boolean;
  likeCount?: number;
  commentCount?: number;
}

interface Comment {
  _id: string;
  content: string;
  userId: string;
  createdAt: string;
}

interface Like {
  _id: string;
  userId: string;
  createdAt: string;
}

interface Post {
  _id: string;
  userId: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  isLiked: boolean;
  likes: Like[];
  comments: Comment[];
}

interface PostListScreenProps {
  route: {
    params: {
      index: number;
      userId: string;
      page: number;
      totalPage: number;
      posts: Post[];
      username: string;
      userPicture: string;
      fullName: string;
      isMyProfile: boolean;
    };
  };
}
