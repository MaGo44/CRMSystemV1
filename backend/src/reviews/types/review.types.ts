export interface CustomerInfo {
  id: string;
  name: string | null;
  email: string;
}

export interface CompanyInfo {
  id: string;
  name: string;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
}

export interface ReviewResponse {
  id: string;
  rating: number;
  comment: string;
  status: string;
  reply?: string | null;
  repliedAt?: Date | null;
  repliedBy?: UserInfo;
  createdAt: Date;
  updatedAt: Date;
  customer?: CustomerInfo;
  company: CompanyInfo;
}

export type CreateReviewResponse = Omit<ReviewResponse, 'updatedAt'>;

export interface ReviewListResponse {
  reviews: ReviewResponse[];
  total: number;
  page: number;
  totalPages: number;
}
