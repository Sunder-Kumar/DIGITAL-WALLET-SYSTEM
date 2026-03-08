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
import KYC from './pages/KYC';
import Security from './pages/Security';
import ConnectedCards from './pages/ConnectedCards';
import Statements from './pages/Statements';
import AddCard from './pages/AddCard';
import LinkBank from './pages/LinkBank';
import Admin from './pages/Admin';
import Layout from './components/Layout';
import NotificationListener from './components/NotificationListener';
import CookieBanner from './components/CookieBanner';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  const AdminRoute = ({ children }) => {
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (!isAdmin) return <Navigate to="/dashboard" />;
    return children;
  };

  return (
    <Router>
      <NotificationListener />
      <CookieBanner />
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/legal" element={isAuthenticated ? <Legal /> : <Navigate to="/login" />} />
          <Route path="/cookie-settings" element={<CookieSettings />} />
          
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/transactions" element={isAuthenticated ? <Transactions /> : <Navigate to="/login" />} />
          <Route path="/scan" element={isAuthenticated ? <Scan /> : <Navigate to="/login" />} />
          <Route path="/insights" element={isAuthenticated ? <Insights /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/contacts" element={isAuthenticated ? <Contacts /> : <Navigate to="/login" />} />
          <Route path="/send" element={isAuthenticated ? <SendMoney /> : <Navigate to="/login" />} />
          <Route path="/add-money" element={isAuthenticated ? <AddMoney /> : <Navigate to="/login" />} />
          <Route path="/request" element={isAuthenticated ? <RequestMoney /> : <Navigate to="/login" />} />
          <Route path="/withdraw" element={isAuthenticated ? <Withdraw /> : <Navigate to="/login" />} />
          <Route path="/bills" element={isAuthenticated ? <Bills /> : <Navigate to="/login" />} />
          <Route path="/kyc" element={isAuthenticated ? <KYC /> : <Navigate to="/login" />} />
          <Route path="/security" element={isAuthenticated ? <Security /> : <Navigate to="/login" />} />
          <Route path="/cards" element={isAuthenticated ? <ConnectedCards /> : <Navigate to="/login" />} />
          <Route path="/statements" element={isAuthenticated ? <Statements /> : <Navigate to="/login" />} />
          <Route path="/cards/add" element={isAuthenticated ? <AddCard /> : <Navigate to="/login" />} />
          <Route path="/banks/link" element={isAuthenticated ? <LinkBank /> : <Navigate to="/login" />} />
          
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
