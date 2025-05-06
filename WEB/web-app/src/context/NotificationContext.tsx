import { createContext, useContext, ReactNode } from "react";
import { notification } from "antd";
import type { NotificationInstance } from "antd/es/notification/interface";

interface NotificationContextType {
  notify: NotificationInstance;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [api, contextHolder] = notification.useNotification();

  return (
    <NotificationContext.Provider value={{ notify: api }}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
};
