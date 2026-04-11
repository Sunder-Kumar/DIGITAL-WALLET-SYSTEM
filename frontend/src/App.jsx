import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Legal from './pages/Legal';
import CookieSettings from './pages/CookieSettings';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Scan from './pages/Scan';
import Insights from './pages/Insights';
import Profile from './pages/Profile';
import Contacts from './pages/Contacts';
import SendMoney from './pages/SendMoney';
import AddMoney from './pages/AddMoney';
import RequestMoney from './pages/RequestMoney';
import Withdraw from './pages/Withdraw';
import Bills from './pages/Bills';
import TransferToCard from './pages/TransferToCard';
import KYC from './pages/KYC';
import Security from './pages/Security';
import ConnectedCards from './pages/ConnectedCards';
import Statements from './pages/Statements';
import AddCard from './pages/AddCard';
import LinkBank from './pages/LinkBank';
import Admin from './pages/Admin';
import MobileTopup from './pages/MobileTopup';
import Devices from './pages/Devices';
import Layout from './components/Layout';
import NotificationListener from './components/NotificationListener';
import CookieBanner from './components/CookieBanner';

function App() {
  const ProtectedRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('token');
    if (!isAuthenticated) return <Navigate to="/login" />;
    return children;
  };

  const AdminRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'admin';

    if (!isAuthenticated) return <Navigate to="/login" />;
    if (!isAdmin) return <Navigate to="/dashboard" />;
    return children;
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <NotificationListener />
      <CookieBanner />
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/legal" element={<ProtectedRoute><Legal /></ProtectedRoute>} />
          <Route path="/cookie-settings" element={<CookieSettings />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/scan" element={<ProtectedRoute><Scan /></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
          <Route path="/send" element={<ProtectedRoute><SendMoney /></ProtectedRoute>} />
          <Route path="/add-money" element={<ProtectedRoute><AddMoney /></ProtectedRoute>} />
          <Route path="/request" element={<ProtectedRoute><RequestMoney /></ProtectedRoute>} />
          <Route path="/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
          <Route path="/transfer-to-card" element={<ProtectedRoute><TransferToCard /></ProtectedRoute>} />
          <Route path="/bills" element={<ProtectedRoute><Bills /></ProtectedRoute>} />
          <Route path="/topup" element={<ProtectedRoute><MobileTopup /></ProtectedRoute>} />
          <Route path="/kyc" element={<ProtectedRoute><KYC /></ProtectedRoute>} />
          <Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
          <Route path="/devices" element={<ProtectedRoute><Devices /></ProtectedRoute>} />
          <Route path="/cards" element={<ProtectedRoute><ConnectedCards /></ProtectedRoute>} />
          <Route path="/statements" element={<ProtectedRoute><Statements /></ProtectedRoute>} />
          <Route path="/cards/add" element={<ProtectedRoute><AddCard /></ProtectedRoute>} />
          <Route path="/banks/link" element={<ProtectedRoute><LinkBank /></ProtectedRoute>} />
          
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

