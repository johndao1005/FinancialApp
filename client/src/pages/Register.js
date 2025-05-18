import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../redux/slices/authSlice';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/');
    }
    
    // Clean up error state when component unmounts
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const { firstName, lastName, email, password, confirmPassword } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Clear field-specific error when user starts typing
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: ''
      });
    }
  };

  const validate = () => {
    const errors = {};
    
    if (!firstName) {
      errors.firstName = 'First name is required';
    }
    
    if (!lastName) {
      errors.lastName = 'Last name is required';
    }
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = e => {
    e.preventDefault();
    
    if (validate()) {
      dispatch(registerUser({ firstName, lastName, email, password }));
    }
  };

  return (
    <div className="auth-container">
      <div className="card">
        <h2 className="auth-title">Create an Account</h2>
        
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className="row">
            <div className="col">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={onChange}
                  className="form-control"
                  placeholder="Your first name"
                />
                {formErrors.firstName && (
                  <div className="text-danger">{formErrors.firstName}</div>
                )}
              </div>
            </div>
            
            <div className="col">
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={onChange}
                  className="form-control"
                  placeholder="Your last name"
                />
                {formErrors.lastName && (
                  <div className="text-danger">{formErrors.lastName}</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              className="form-control"
              placeholder="Your email address"
            />
            {formErrors.email && (
              <div className="text-danger">{formErrors.email}</div>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              className="form-control"
              placeholder="Choose a password"
            />
            {formErrors.password && (
              <div className="text-danger">{formErrors.password}</div>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              className="form-control"
              placeholder="Confirm your password"
            />
            {formErrors.confirmPassword && (
              <div className="text-danger">{formErrors.confirmPassword}</div>
            )}
          </div>
          
          <button
            type="submit"
            className="btn"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
