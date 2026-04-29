import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Admin Pages
import AdminAuth from "./admin/pages/AdminAuth";
import Dashboard from "./admin/pages/Dashboard";
import CategoryMaster from "./admin/pages/CategoryMaster";
import ProductMaster from "./admin/pages/ProductMaster";
import AdminLayout from "./admin/layout/AdminLayout";

// Client Pages
// import Home from "./client/pages/Home";
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

    if (role && user?.role !== role) {
        return <Navigate to="/" />;
    }

    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* ===== CLIENT ROUTES ===== */}
                <Route path="/products" element={<Products />} />

                {/* ===== ADMIN ROUTES ===== */}
                <Route path="/admin/login" element={<AdminAuth />} />

                <Route path="/admin" element={
                    <ProtectedRoute role="ADMIN">
                        <AdminLayout />
                    </ProtectedRoute>
                }>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="categories" element={<CategoryMaster />} />
                    <Route path="products" element={<ProductMaster />} />
                </Route>

                {/* ===== FALLBACK ===== */}
                <Route path="*" element={<h1>404 Not Found</h1>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;