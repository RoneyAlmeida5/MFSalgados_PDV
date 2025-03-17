import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import Login from "../Login/Login";
import CaixaMercadinho from "../CaixaMercadinho/CaixaMercadinho";

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem("authToken");
    return token ? children : <Navigate to="/login" />;
  };

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/caixamercadinho" element={<CaixaMercadinho />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;