import api from "@/lib/api";
export const sendRequest = (receiverId: number, message?: string) =>
  api.post("/connections/request", {
    receiverId,
    message,
  });

export const acceptRequest = (requestId: number) =>
  api.put(`/connections/request/${requestId}/accept`);

export const rejectRequest = (requestId: number) =>
  api.put(`/connections/request/${requestId}/reject`);

export const cancelRequest = (requestId: number) =>
  api.put(`/connections/request/${requestId}/cancel`);

export const getConnections = () =>
  api.get("/connections");

export const getReceivedRequests = () =>
  api.get("/connections/requests/received");

export const getSentRequests = () =>
  api.get("/connections/requests/sent");

export const getSuggestions = () =>
  api.get("/connections/suggestions");

export const getStatus = (userId: number) =>
  api.get(`/connections/status/${userId}`);

export const removeConnection = (userId: number) =>
  api.delete(`/connections/${userId}`);

export const getMutualConnections = (userId: number) =>
  api.get(`/connections/mutual/${userId}`);