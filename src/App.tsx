import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AttendancePage from './pages/AttendancePage';
import ReportsPage from './pages/ReportsPage';
import AdminPage from './pages/AdminPage';
import SummaryPage from './pages/SummaryPage';
import DetailedRecordsPage from './pages/DetailedRecordsPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/detailed-records" element={<DetailedRecordsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;