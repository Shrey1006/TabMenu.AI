import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import ROICalculator from "./pages/ROICalculator";
import Login from "./pages/Login";
import Customer from "./pages/Customer";
import TableGuest from "./pages/TableGuest";
import QrGenerator from "./pages/QrGenerator";
import Kitchen from "./pages/Kitchen";
import Waiter from "./pages/Waiter";
import Admin from "./pages/Admin";

function Layout() {
  const location = useLocation();
  const hideNav = [
    "/login",
    "/customer",
    "/table",
    "/qr",
    "/kitchen",
    "/waiter",
    "/admin",
  ].some((p) => location.pathname.startsWith(p));

  return (
    <>
      {!hideNav && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/roi" element={<ROICalculator />} />
        <Route path="/login" element={<Login />} />
        <Route path="/customer" element={<Customer />} />
        <Route path="/table/:tableNumber" element={<TableGuest />} />
        <Route path="/qr" element={<QrGenerator />} />
        <Route path="/kitchen" element={<Kitchen />} />
        <Route path="/waiter" element={<Waiter />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  );
}

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
