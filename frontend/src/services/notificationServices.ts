import api from "./api";

export const getNotifications = () => {  // 👈 Add this
  return api.get("/notifications/");
};
export const markNotificationRead = (id: number) => {
  return api.patch(`/notifications/${id}/`);
};