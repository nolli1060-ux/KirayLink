export type InquiryStatus = "pending" | "reviewed" | "responded";

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation?: string;
  propertyPrice?: number;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  landlordId: string;
  message: string;
  moveInDate?: string;
  status: InquiryStatus;
  createdAt: string;
}
