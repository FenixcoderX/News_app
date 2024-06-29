import React from 'react';
import './NotificationBell.sass';
import { FaBell } from 'react-icons/fa';

const NotificationBell = ({ messageCount }) => {
  return (
    <div className="bell-icon">
      <FaBell />
      {/* <i className="fa fa-bell"></i> */}
      {messageCount > 0 && (
        <span className="message-count">{messageCount}</span>
      )}
    </div>
  );
};

export default NotificationBell;
