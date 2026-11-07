export interface IUser {
  totalUsers: number;
  metadata: Metadata;
  users: User[];
}

export interface Metadata {
  currentPage: number;
  numberOfPages: number;
  limit: number;
  nextPage: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}
