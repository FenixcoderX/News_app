import './SignUp.sass';
import { useState, useEffect } from 'react';
import loginpic from '../assets/logo/IMG_5694.png';
import { Link, useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    setPasswordMatch(
      formData.password === formData.confirmPassword ||
        formData.confirmPassword === ''
    );
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((formData) => ({
      ...formData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      });
      const data = await res.json();
      if (data.success === false) {
        if (data.message.includes('name_1 dup key')) {
          return setErrorMessage('Username already exists');
        }
        if (data.message.includes('email_1 dup key')) {
          return setErrorMessage('E-mail already exists');
        }
        return setErrorMessage('Something went wrong');
      }

      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
      });
      navigate(-1);
    } catch (err) {
      setErrorMessage('Something went wrong');
    }
  };

  return (
    <div className="signup-container">
      <h3 className="signup-header">NEWS</h3>
      <img src={loginpic} alt="loginpic" className="signup-pic" />

      <h5>Sign Up</h5>

      <form className="signup-form input-form mb-3" onSubmit={handleSubmit}>
        <label className="signup-label form-label">E-mail</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className="form-control"
          maxLength={100}
        />
        <label className="signup-label form-label">Username</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="form-control"
          maxLength={20}
        />
        <label className="signup-label form-label">Password</label>
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          className="form-control"
          maxLength={100}
        />
        <label className="signup-label form-label">Confirm Password</label>
        <input
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="form-control"
          maxLength={100}
        />
        <button
          className="btn btn-dark text-nowrap mt-2"
          type="submit"
          disabled={
            formData.email === '' ||
            formData.password === '' ||
            formData.confirmPassword === '' ||
            formData.name === '' ||
            !passwordMatch
          }
        >
          Sign Up
        </button>
        {!passwordMatch && (
          <p style={{ color: 'red' }}>Passwords are not matched!</p>
        )}
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </form>
      <div>
        {' '}
        Already have an account? <Link onClick={goBack}>Log In</Link>
      </div>
    </div>
  );
};

export default SignUp;
