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
  [x: string]: ReactNode;
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

export interface ClientCreate {
  fullname: string;
  phone: string;
  telegram_id?: number;
  telegram_username?: string;
  conversation_file?: string;
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

// Plan types (based on PlansPage.tsx)

export interface Plan extends PlanCreateUpdate {
  id: number;
}

// List uchun (GET /plans)
export interface PlanListItem {
  id: number;
  month: string;
  total_lead: number;
}

// Create/Update uchun (POST va PATCH body)
export interface PlanCreateUpdate {
  month?: string;
  total_lead?: number;
  pdf?: {
    new_pdf_total: number;
    old_pdf_total: number;
    pdf_total: number;
  };
  book?: {
    new_book_total: number;
    old_book_total: number;
    book_total: number;
  };
}

// Detail uchun (GET /plans/{id})
export interface PlanDetail {
  id: number;
  month: string;
  total_lead: number;
  plans: {
    counts: {
      pdf: { new: number; old: number; total: number };
      book: { new: number; old: number; total: number };
    };
    sums: {
      pdf: { new: number; old: number; total: number };
      book: { new: number; old: number; total: number };
      overall: { total: number };
    };
  };
  facts: {
    counts: {
      pdf: { new: number; old: number; total: number };
      book: { new: number; old: number; total: number };
    };
    sums: {
      pdf: { new: number; old: number; total: number };
      book: { new: number; old: number; total: number };
      overall: { total: number };
    };
  };
  percents: {
    pdf: { new: number; old: number; total: number };
    book: { new: number; old: number; total: number };
    overall: { count_percent: number; sum_percent: number };
  };
}

// User/Client response type (based on SalesList/DetailPage.tsx)
// This is an assumed structure because the API docs for /clients don't match the frontend code.
export interface UserResponse {
  id: number; // This is likely the client's own ID in the clients table
  user_id: number; // This is the telegram user_id, used for navigation and actions
  fullname: string;
  phone: string;
  conversation_file: string | null;
  created_at: string;
  updated_at: string;
  // Aggregated/denormalized fields for list view
  format: string;
  status: string;
  shipping_info: string | null;
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

// Prices
export interface PriceResponse {
  pdf_old_price: number;
  book_old_price: number;
  pdf_price: number;
  book_price: number;
}

// Feedbacks
export interface FeedbackListResponse {
  total: number;
  items: FeedbackItem[];
}

// Telegram
export interface TelegramSendImageResponse {
  success: boolean;
  user_id: number;
  message: string;
}
