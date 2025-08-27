import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './component/Login';
import PlacementReadinessAnalyzer from './component/Placement';
import ProtectedRoute from './component/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/placement" 
          element={
            <ProtectedRoute>
              <PlacementReadinessAnalyzer />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
