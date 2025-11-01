interface IApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

interface IMessage {
  id: string;
  sender: string;
  uuid: string;
  receiver: string;
  content: string;
  type: 'text' | 'gif' | 'post' | 'image' | 'reel';
  isRead: boolean;
  expiresAt?: string; // Optional, set based on user preference
  isPermanent: boolean;
  createdAt: string;
  updatedAt?: string;
  seenBy: Array<string>;
  post: any;
  postId: any; //might come object from backend
  replyToMessageObject?: IMessage;
  replyTo?: IMessage;
  isPrivate?: boolean;
}

interface IUIMessage {
  id: string;
  text: string;
  sender: string;
  time: string;
  createdAt: string;
  status: string;
  replyTo?: any;
  type: 'text' | 'gif' | 'post' | 'image' | 'reel';
  post: any;
  isPostPrivate: boolean;
}

interface IConversation {
  _id: string;
  userId: string;
  userName: string;
  userImage?: string;
  lastMessage?: IMessage;
  lastMessageTime?: string;
  unreadCount: number;
  participant?: {_id: string; username: string; profilePicture?: string};
  conversationId: string;
  messagesDisappear: boolean;
  streakData?: {
    currentCount: number;
    lastStreakCount: number;
    isActive: boolean;
    canRecover: boolean;
    isDanger: boolean;
  };
}

interface IUser {
  _id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  coins: number;
  profilePicture?: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  hasUsernameChanged: boolean;
  email?: string | null;
  hasEmailSet: boolean;
  password?: string;
  phoneNumber: string;
  address?: string;
  otp?: string | null;
  otp_expiry?: Date | null;
  bio?: string;
  dailyPostCount: number;
  lastPostCountReset: string;
  isVerified: boolean;
  isProfileCompleted: boolean;
  provider?: string;
  providerId?: string;
  friends: Array<IUser>;
  conversations?: Array<Conversation>;
  location: {
    type: 'Point';
    coordinates: number[];
  };
  interests: string[];
  totalSaved: number;
  lastActive: Date;
}

interface IConversationData {
  messages: IMessage[];
  nextCursor?: string;
  prevCursor?: string;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  unreadCount?: number;
  conversation: any;
  isBlocked: boolean;
}
