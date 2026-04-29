import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Admin Pages
import AdminAuth from "./admin/pages/AdminAuth";
import Dashboard from "./admin/pages/Dashboard";
import CategoryMaster from "./admin/pages/CategoryMaster";
import ProductMaster from "./admin/pages/ProductMaster";
import Profile from "./admin/pages/Profile";
import VerifyEmail from "./admin/pages/VerifyEmail";
import ForgotPassword from "./admin/pages/ForgotPassword";
import AuditLogs from "./admin/pages/AuditLogs";
import NotFound from "./admin/pages/NotFound";
import AdminLayout from "./admin/layout/AdminLayout";

// Client Pages
import Products from "./client/pages/Products";

// Protected Route
const ProtectedRoute = ({ children, role }) => {
    const token = localStorage.getItem("token");
    let user = null;
    try {
        const userStr = localStorage.getItem("user");
        if (userStr && userStr !== "undefined") {
            user = JSON.parse(userStr);
        }
    } catch (e) {
        console.error("Failed to parse user", e);
    }

    if (!token) return <Navigate to="/admin/login" />;
    if (role && user?.role !== role) return <Navigate to="/" />;
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* ===== CLIENT ROUTES ===== */}
                <Route path="/products" element={<Products />} />

                {/* ===== PUBLIC AUTH ROUTES ===== */}
                <Route path="/admin/login" element={<AdminAuth />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* ===== ADMIN ROUTES ===== */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute role="ADMIN">
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="categories" element={<CategoryMaster />} />
                    <Route path="products" element={<ProductMaster />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="audit-logs" element={<AuditLogs />} />
                </Route>

                {/* ===== FALLBACK ===== */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;