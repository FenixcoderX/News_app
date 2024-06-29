import './NavBar.sass';
import { useResize, useWebSocket } from '../utils/hooks';
import { Link, NavLink } from 'react-router-dom';
import homeicon from '../assets/logo/IMG_5694.png';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { logOut } from '../redux/user/userSlice';
import { HiUser } from 'react-icons/hi';
import NotificationBell from './NotificationBell';

const NavBar = () => {
  // Use hook to save window width and screen size flags to variable
  const screenWidthTrueFalse = useResize();
  const dispatch = useDispatch();
  const userName = useSelector((state) => state.user.userName);
  const displayName = userName === '' ? 'Guest' : userName;
  console.log('userName:', userName === '');

  const notifications = useWebSocket(userName);
  console.log('messages:', notifications);

  /**
   * Logs out the authenticated user
   * @param {Event} e - The event object
   */
  const logout = async (e) => {
    e.preventDefault();
    if (userName !== '') {
      if (window.confirm('Are you sure you want to log out?')) {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/auth/logout`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            }
          );

          const responseJSON = await response.json();

          if (responseJSON.success === false) {
            throw new Error(responseJSON.message);
          }

          dispatch(logOut());
        } catch (error) {
          console.error('Error:', error);
          alert('Problem with logging out');
        }
      }
    }
  };

  return (
    <section className="nav-bar-container">
      <nav className="nav-bar-menu">
        <ul>
          <li>
            <Link className="navbar-brand" to="/">
              <img src={homeicon} alt="Home" style={{ width: '30px' }} />
            </Link>
          </li>
          <li>
            <NavLink
              className={({ isActive }) =>
                isActive
                  ? 'btn btn-outline-secondary nav-bar-button text-nowrap nav-bar-link-active'
                  : 'btn btn-outline-secondary nav-bar-button text-nowrap nav-bar-link'
              }
              to="/new"
            >
              New News
            </NavLink>
          </li>
        </ul>
      </nav>
      <span className="nav-bar-login">
        {/* If the screen width is not small then display this html code */}
        {!screenWidthTrueFalse.isScreenSm && (
          <ul>
            <li>
              <HiUser className="nav-bar-icon-user" />
            </li>
            <li>
              <NotificationBell messageCount={notifications.length} />
            </li>
            <li id="nav-bar-user-name">
              <span>{displayName}</span>
            </li>
            <li>
              <Link
                className="btn btn-outline-secondary nav-bar-button text-nowrap"
                to="/login"
              >
                LogIn
              </Link>
            </li>
            <li>
              <button
                className="btn btn-outline-secondary nav-bar-button text-nowrap"
                onClick={logout}
                disabled={userName === ''}
              >
                Logout
              </button>
            </li>
          </ul>
        )}
        {/* If the screen width is small then display this html code */}
        {screenWidthTrueFalse.isScreenSm && (
          <div className="dropdown nav-bar-dropdown">
            <span
              className=""
              type="button"
              id=""
              data-bs-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <HiUser className="icon-user" />
            </span>
            <ul className="dropdown-menu nav-bar-dropdown-menu" aria-labelledby="dropdownMenuButton">
              <li className='nav-bar-notification-bell-container'>
                <NotificationBell messageCount={notifications.length} />
              </li>
              <li id="nav-user-name" className="drop-down-container nav-bar-drop-down-container">
                {displayName}
              </li>
              <li className="drop-down-container nav-bar-drop-down-container">
                <Link
                  className="btn btn-outline-secondary nav-bar-button text-nowrap"
                  to="/login"
                >
                  LogIn
                </Link>
              </li>
              <li className="drop-down-container nav-bar-drop-down-container">
                <button
                  className="btn btn-outline-secondary nav-bar-button text-nowrap"
                  type="button"
                  onClick={logout}
                  disabled={userName === ''}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </span>
    </section>
  );
};

export default NavBar;
