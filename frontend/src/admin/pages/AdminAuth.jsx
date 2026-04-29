import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

export default function AdminAuth() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '2rem 0' }}>
            {isLogin ? (
                <Login toggleForm={setIsLogin} />
            ) : (
                <Signup toggleForm={setIsLogin} />
            )}
        </div>
    );
}
