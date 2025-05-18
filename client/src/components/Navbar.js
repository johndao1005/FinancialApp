import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Check if the current path matches the link
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">SmartSpend</div>
      <ul className="nav-menu">
        <li className="nav-item">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
        </li>
        <li className="nav-item">
          <Link 
            to="/transactions" 
            className={`nav-link ${isActive('/transactions') ? 'active' : ''}`}
          >
            Transactions
          </Link>
        </li>
        <li className="nav-item">
          <Link 
            to="/upload" 
            className={`nav-link ${isActive('/upload') ? 'active' : ''}`}
          >
            Upload
          </Link>
        </li>
        <li className="nav-item">
          <Link 
            to="/profile" 
            className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
          >
            Profile
          </Link>
        </li>
        <li className="nav-item">
          <button onClick={handleLogout} className="btn btn-sm">
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
