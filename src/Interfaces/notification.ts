export enum ENotificationType {
  FRIEND_REQUEST = 'friend_request',
  FRIEND_ACCEPT = 'friend_accept',
  FRIEND_REJECT = 'friend_reject',
  COMMENT = 'comment',
  LIKE = 'like',
  MENTION = 'mention',
  MESSAGE = 'message',
  SYSTEM = 'system',
  EVENT = 'event',
  // Add more types if needed
}

export enum ENotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface INotificationAction {
  type: string;
  label: string;
  value?: string;
}

export interface INotification {
  _id: string;
  content: string;
  title: string;
  type: ENotificationType;
  isRead: boolean;
  recipient: string;
  sender: {
    username: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
    _id: string;
  };
  relatedItemId: string;
  actionRequired: boolean;
  actions: INotificationAction[];
  priority: ENotificationPriority;
  isArchived: boolean;
  metadata: Record<string, any>;
  expiresAt?: string;
  createdAt: string;
}
