import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const SCREEN_SM = 510;
// const SCREEN_MD = 768;

/**
 * Custom hook that tracks the window width and provides screen size flags based on breakpoints.
 *
 * @returns {Object} An object containing the window width and screen size flags.
 */
export const useResize = () => {
  const [width, setWidth] = useState(window.innerWidth); // State variable to hold the window width

  useEffect(() => {
    const handleResize = (event) => {
      setWidth(event.target.innerWidth); // Update width state on window resize
    };

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup function to remove event listener when component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array ensures useEffect runs only once after initial render

  // Return an object containing window width and screen size flags based on breakpoints
  return {
    width,
    isScreenSm: width <= SCREEN_SM,
    // isScreenMd: width <= SCREEN_MD,
  };
};


export function useWebSocket(userName) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const socket = io(process.env.REACT_APP_API_URL, {
      withCredentials: true,
    });

    // Connect to websocket
    socket.on('connect', () => {
      console.log('Connection to server successful!');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    socket.on('notification', (notification) => {
      setNotifications((prevNotifocations) => [...prevNotifocations, notification]);
      console.log('Notification recieved:', notification);
    });

    return () => {
      setNotifications([])
      socket.off('connect');
      socket.off('notification');
      socket.disconnect();
    };
  }, [userName]);

  return notifications;
}