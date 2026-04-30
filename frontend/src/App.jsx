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
import GeneralSettings from "./admin/pages/GeneralSettings";
import UserSettings from "./admin/pages/UserSettings";
import WebsiteSettings from "./admin/pages/WebsiteSettings";
import IntegrationSettings from "./admin/pages/IntegrationSettings";
import RecycleBin from "./admin/pages/RecycleBin";
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
    
    const validRoles = ["ADMIN", "EDITOR", "VIEWER"];
    if (!validRoles.includes(user?.role)) return <Navigate to="/admin/login" />;

    if (role && user?.role !== role) {
        // If they don't have the specific role (e.g. they are a VIEWER trying to access an ADMIN-only page)
        // for now, we'll let them see the dashboard instead of an infinite loop
        return <Navigate to="/admin/dashboard" />;
    }
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Redirect root to dashboard */}
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

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
                        <ProtectedRoute>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route 
                        path="categories" 
                        element={
                            <ProtectedRoute role="ADMIN">
                                <CategoryMaster />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="products" 
                        element={
                            <ProtectedRoute role="ADMIN">
                                <ProductMaster />
                            </ProtectedRoute>
                        } 
                    />
                    <Route path="profile" element={<Profile />} />
                    <Route 
                        path="audit-logs" 
                        element={
                            <ProtectedRoute role="ADMIN">
                                <AuditLogs />
                            </ProtectedRoute>
                        } 
                    />
                    
                    {/* Settings Sub-routes (Admin Only) */}
                    <Route 
                        path="settings/general" 
                        element={
                            <ProtectedRoute role="ADMIN">
                                <GeneralSettings />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="settings/users" 
                        element={
                            <ProtectedRoute>
                                <UserSettings />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="settings/website" 
                        element={
                            <ProtectedRoute role="ADMIN">
                                <WebsiteSettings />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="settings/integration" 
                        element={
                            <ProtectedRoute role="ADMIN">
                                <IntegrationSettings />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="recycle-bin" 
                        element={
                            <ProtectedRoute role="ADMIN">
                                <RecycleBin />
                            </ProtectedRoute>
                        } 
                    />
                </Route>

                {/* ===== FALLBACK ===== */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;