import { api } from "./api";

export interface UpdateOrderPayload {
    format?: string;
    purchase_month?: string;
    shipping_info?: string;
    order_count?: number;
    bts_branch_id?: number;
    delivery_days?: number;
    pdf_month_id?: number;
    status?: string;
}

export const updateOrder = (orderId: number | string, data: UpdateOrderPayload) => {
    return api.patch(`/clients/order/${orderId}`, data);
};