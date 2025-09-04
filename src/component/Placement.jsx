import React, { useState, useEffect, useRef, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { Chart, DoughnutController, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { FaSignOutAlt, FaChartPie, FaEdit, FaChartLine, FaClipboardList, FaInfoCircle, FaExclamationCircle, FaPenFancy, FaCheckCircle } from 'react-icons/fa'; // Updated import
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Placement.css';

Chart.register(DoughnutController, ArcElement, Title, Tooltip, Legend);

const PlacementReadinessAnalyzer = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scores, setScores] = useState({});
  const [readinessScore, setReadinessScore] = useState(null);
  const [improvementPlan, setImprovementPlan] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const username = Cookies.get('username');

  const gaugeChartRef = useRef(null);
  const gaugeChartInstance = useRef(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/student/${username}`);
        if (!response.ok) throw new Error('Failed to fetch student data');
        const studentData = await response.json();
        setScores({
          aptitude: studentData.aptitude,
          coding: studentData.coding,
          resume: studentData.resume,
          interview: studentData.interview
        });
        setStudentName(studentData.name);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchStudentData();
  }, []);

  useEffect(() => {
    const fetchReadinessData = async () => {
      try {
        const response = await fetch('http://localhost:5000/readiness', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: username,
            ...scores
          })
        });
        if (!response.ok) throw new Error('Failed to fetch readiness data');
        const data = await response.json();
        setReadinessScore(data.readinessScore);

        const planResponse = await fetch('http://localhost:5000/improvement-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scores)
        });
        if (!planResponse.ok) throw new Error('Failed to fetch improvement plan');
        const planData = await planResponse.json();
        setImprovementPlan(planData.improvementPlan);
      } catch (error) {
        setError(error.message);
      }
    };

    if (Object.keys(scores).length > 0) {
      fetchReadinessData();
    }
  }, [scores, username]);

  const drawGaugeChart = useCallback(() => {
    if (!gaugeChartRef.current) {
      console.error('Gauge chart canvas is not available');
      return;
    }
    const ctx = gaugeChartRef.current.getContext('2d');

    if (gaugeChartInstance.current) {
      gaugeChartInstance.current.destroy();
    }

    gaugeChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [readinessScore, 100 - readinessScore],
          backgroundColor: [
            getColorForScore(readinessScore),
            '#e9ecef'
          ],
          borderWidth: 0,
          circumference: 180,
          rotation: 270
        }]
      },
      options: {
        cutout: '80%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        },
        animation: {
          animateRotate: true,
          animateScale: true
        }
      }
    });
  }, [readinessScore]);

  useEffect(() => {
    drawGaugeChart();
  }, [readinessScore, drawGaugeChart]);

  const getColorForScore = (score) => {
    if (score >= 80) return '#4cc9f0';
    if (score >= 60) return '#f72585';
    return '#e63946';
  };

  const handleScoreChange = (e, category) => {
    const value = parseInt(e.target.value);
    setScores(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleCalculate = () => {
    setActiveTab('dashboard');
  };

  const logout = () => {
    Cookies.remove('username');
    navigate('/');
  };

  const ProgressBar = ({ label, value }) => (
    <div className="score-item">
      <div className="score-label">
        <span className="score-name">{label}</span>
        <span className="score-value">{value}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );

  return (
    <div className="placement-readiness-analyzer">
      <FaSignOutAlt 
        onClick={logout} 
        className="logout-icon" 
        style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer', fontSize: '1.5rem', color: '#333' }} 
      />
      <div className="container">
        <header>
          <div className="student-info">
            <div className="student-name">{studentName || 'Loading...'}</div>
          </div>
        </header>

        <div className="tabs">
          <div className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <FaChartPie /> Dashboard 
          </div>
          <div className={`tab ${activeTab === 'input' ? 'active' : ''}`} onClick={() => setActiveTab('input')}>
            <FaEdit /> Input Data 
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="tab-content active">
            <div className="dashboard">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">
                    <FaChartLine /> Placement Readiness {/* Updated icon */}
                  </div>
                </div>
                <div className="readiness-gauge">
                  <div className="chart-container">
                    <canvas ref={gaugeChartRef}></canvas>
                    <div className="gauge-value">{readinessScore}%</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div className="card-title">
                    <FaChartPie /> Score Breakdown {/* Updated icon */}
                  </div>
                </div>
                <div className="score-breakdown">
                  <ProgressBar label="Aptitude Tests" value={scores.aptitude} />
                  <ProgressBar label="Coding Skills" value={scores.coding} />
                  <ProgressBar label="Resume Strength" value={scores.resume} />
                  <ProgressBar label="Interview Skills" value={scores.interview} />
                </div>
              </div>

              <div className="card improvement-plan">
                <div className="card-header">
                  <div className="card-title">
                    <FaClipboardList /> Personalized Improvement Plan {/* Updated icon */}
                  </div>
                </div>
                {improvementPlan.map((plan, index) => (
                  <div key={index} className={`plan-item priority-${plan.priority}`}>
                    <div className="plan-icon">
                      {plan.priority === 'high' ? <FaExclamationCircle /> : plan.priority === 'medium' ? <FaPenFancy /> : <FaCheckCircle />} {/* Updated icons */}
                    </div>
                    <div className="plan-content">
                      <h4>{plan.title}</h4>
                      <p>{plan.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'input' && (
          <div className="tab-content active">
            <div className="card data-input">
              <div className="card-header">
                <div className="card-title">
                  <FaEdit /> Enter Your Performance Data {/* Updated icon */}
                </div>
                <FaInfoCircle style={{color: '#6c757d'}} /> {/* Updated icon */}
              </div>
              
              <div className="input-group">
                <label htmlFor="aptitude">Aptitude Test Score (out of 100)</label>
                <input 
                  type="number" 
                  id="aptitude" 
                  min="0" 
                  max="100" 
                  value={scores.aptitude}
                  onChange={(e) => handleScoreChange(e, 'aptitude')}
                />
              </div>
              
              <div className="input-group">
                <label htmlFor="coding">Coding Test Score (out of 100)</label>
                <input 
                  type="number" 
                  id="coding" 
                  min="0" 
                  max="100" 
                  value={scores.coding}
                  onChange={(e) => handleScoreChange(e, 'coding')}
                />
              </div>
              
              <div className="input-group">
                <label htmlFor="resume">Resume Strength Score (out of 100)</label>
                <input 
                  type="number" 
                  id="resume" 
                  min="0" 
                  max="100" 
                  value={scores.resume}
                  onChange={(e) => handleScoreChange(e, 'resume')}
                />
              </div>
              
              <div className="input-group">
                <label htmlFor="interview">Mock Interview Score (out of 100)</label>
                <input 
                  type="number" 
                  id="interview" 
                  min="0" 
                  max="100" 
                  value={scores.interview}
                  onChange={(e) => handleScoreChange(e, 'interview')}
                />
              </div>
              
              <button className="btn" onClick={handleCalculate}>
                <FaChartLine /> Calculate Readiness {/* Updated icon */}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacementReadinessAnalyzer;