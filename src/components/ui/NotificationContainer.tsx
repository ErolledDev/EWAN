import React from 'react';
import Notification, { NotificationProps } from './Notification';

interface NotificationContainerProps {
  notifications: NotificationProps[];
  onClose: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onClose,
}) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col space-y-4 max-h-screen overflow-hidden pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="transform transition-all duration-500 ease-in-out pointer-events-auto">
          <Notification {...notification} onClose={onClose} />
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;