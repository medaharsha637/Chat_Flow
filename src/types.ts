export interface User {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  photoURL: string;
  bio: string;
  isPrivate: boolean;
  followerCount: number;
  followingCount: number;
  createdAt: string;
  updatedAt: string;
  online: boolean;
  lastSeen: string;
}

export interface Post {
  id: string;
  authorId: string;
  type: 'post' | 'reel';
  mediaUrl: string;
  thumbnailUrl: string;
  caption: string;
  hashtags: string[];
  likesCount: number;
  commentsCount: number;
  viewCount: number;
  isPrivate: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface Follow {
  followerId: string;
  followingId: string;
  status: 'pending' | 'accepted';
  createdAt: string;
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  participants: string[];
  name?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  mediaUrl?: string;
  type: 'text' | 'image' | 'video';
  seen: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  type: 'like' | 'comment' | 'follow' | 'message';
  targetId: string;
  read: boolean;
  createdAt: string;
}
