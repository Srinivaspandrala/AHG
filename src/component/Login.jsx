import React, { useState } from 'react';
import { FaBrain, FaCalculator, FaBookOpen, FaChartPie } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (username.trim() === '') {
      alert('Please enter your username');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username })
      });

      if (!response.ok) throw new Error('Failed to submit username');

      // Store username in a cookie
      Cookies.set('username', username, { expires: 7 });

      navigate('/placement');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="container-login">
        <div className="login-form">
          <h2>Login</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input 
                type="text" 
                id="username" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
            </div>

            <button type="submit">Login</button>
          </form>
        </div>

        <div className="ad-section-login">
          <div className="ad-content-login">
            <img src="https://aptitudeguru.in/agh-logo1.webp" alt="Logo" className="login-logo" />

            <h3>Aptitude Guru Hem</h3>
            <p>Unlock powerful features of Aptitude Guru Hema that make learning smarter and easier.</p>

            <div className="features">
              <div className="feature">
                <FaBrain />
                <span>Logical Reasoning Mastery</span>
              </div>
              <div className="feature">
                <FaCalculator />
                <span>Quick Math Tricks</span>
              </div>
              <div className="feature">
                <FaBookOpen />
                <span>Conceptual Clarity</span>
              </div>
              <div className="feature">
                <FaChartPie />
                <span>Performance Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;