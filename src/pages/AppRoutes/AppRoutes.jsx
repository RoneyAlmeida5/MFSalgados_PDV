import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import Login from "../Login/Login";
import CaixaMercadinho from "../CaixaMercadinho/CaixaMercadinho";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/caixamercadinho"
          element={
            <PrivateRoute>
              <CaixaMercadinho />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
