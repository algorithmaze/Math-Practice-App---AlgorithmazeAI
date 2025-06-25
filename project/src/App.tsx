import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardScreen from './screens/DashboardScreen';
import TopicListScreen from './screens/TopicListScreen';
import PracticeScreen from './screens/PracticeScreen';
import FeedbackScreen from './screens/FeedbackScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/topics/:unitId" element={<TopicListScreen />} />
          <Route path="/practice/:topicId" element={<PracticeScreen />} />
          <Route path="/feedback" element={<FeedbackScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;