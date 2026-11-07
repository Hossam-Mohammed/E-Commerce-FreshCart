export interface IReview {
  data: Data;
}

export interface Data {
  _id: string;
  review: string;
  rating: number;
  product: string;
  user: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
