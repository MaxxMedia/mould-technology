export type ConnectionStatus =
  | "SELF"
  | "CONNECTED"
  | "PENDING_SENT"
  | "PENDING_RECEIVED"
  | "NOT_CONNECTED";

export interface User {
  id: number;
  fullName: string;
  username?: string;
  email?: string;
  profileImage?: string | null;
  headline?: string | null;
  location?: string | null;
}

export interface ConnectionRequest {
  id: number;
  senderId: number;
  receiverId: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  message?: string | null;
  createdAt: string;
  updatedAt?: string;
  acceptedAt?: string | null;
  respondedAt?: string | null;

  sender?: User;
  receiver?: User;
}

export interface ConnectionStatusResponse {
  status: ConnectionStatus;
  requestId?: number;
}