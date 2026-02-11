// API Types based on new backend OpenAPI schema

export interface AdminLogin {
  username: string;
  password: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// Client Types
export interface ClientListItem {
  id: number;
  fullname: string;
  phone: string;
  conversation_file: string | null;
  created_at: string;
  updated_at: string;
  orders_count: number;
  reservations_count: number;
  followups_count: number;
  feedbacks_count: number;
}

export interface ClientListResponse {
  total: number;
  items: ClientListItem[];
}

export interface OrderItem {
  id: number;
  format: string | null;
  purchase_month: string | null;
  status: string;
  created_at: string;
}

export interface ReservationItem {
  id: number;
  reserved_until: string;
  status: string;
  created_at: string;
}

export interface FollowUpItem {
  id: number;
  follow_up_time: string;
  type: string;
  status: string;
  created_at: string;
}

export interface FeedbackItem {
  id: number;
  content: string;
  created_at: string;
}

export interface ClientDetailResponse {
  id: number;
  fullname: string;
  phone: string;
  conversation_file: string | null;
  created_at: string;
  updated_at: string;
  orders: OrderItem[];
  reservations: ReservationItem[];
  followups: FollowUpItem[];
  feedbacks: FeedbackItem[];
}

// Dashboard Types
export interface DashboardToday {
  messages_count: number;
  pdf_sales: number;
  book_sales: number;
  income_sum: number;
}

export interface PlanDetails {
  new: {
    count: number;
    sum: number;
  };
  old: {
    count: number;
    sum: number;
  };
  total: {
    count: number;
    sum: number;
  };
}

export interface CurrentMonthPlan {
  plan_id: number;
  month: string;
  percents: {
    pdf: number;
    book: number;
    overall: number;
  };
  plans: {
    pdf: PlanDetails;
    book: PlanDetails;
    overall: {
      count: number;
      sum: number;
    };
  };
  facts: {
    pdf: {
      count: number;
      sum: number;
    };
    book: {
      count: number;
      sum: number;
    };
    overall: {
      count: number;
      sum: number;
    };
  };
}

export interface DashboardResponse {
  today: DashboardToday;
  current_month_plan: CurrentMonthPlan;
}

// PDF Channels
export interface PDFChannelCreate {
  channel_name: string;
  channel_month: string;
  channel_link: string;
  is_active?: boolean;
}

export interface PDFChannelUpdate {
  channel_name?: string | null;
  channel_month?: string | null;
  channel_link?: string | null;
  is_active?: boolean | null;
}

export interface PDFChannelResponse {
  id: number;
  channel_name: string;
  channel_month: string;
  channel_link: string;
  is_active: boolean;
  created_at: string;
}

export interface PDFChannelListResponse {
  total: number;
  items: PDFChannelResponse[];
}

// Reservations
export interface ReservationResponse {
  id: number;
  user_id: number;
  fullname: string;
  phone: string;
  reserved_until: string;
  payment_reminder_sent: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// Image Upload
export interface ImageUploadResponse {
  success: boolean;
  user_id: number;
  message: string;
}

// Validation Errors
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
  input?: any;
  ctx?: Record<string, any>;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}
