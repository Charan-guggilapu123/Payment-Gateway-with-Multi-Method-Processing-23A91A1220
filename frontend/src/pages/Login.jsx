import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        if (email === 'test@example.com') {
            localStorage.setItem('isAuthenticated', 'true');
            navigate('/dashboard');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="card" style={{ maxWidth: '400px', margin: '100px auto' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Merchant Login</h2>
                <form data-test-id="login-form" onSubmit={handleLogin}>
                    <input
                        className="input"
                        data-test-id="email-input"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <input
                        className="input"
                        data-test-id="password-input"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button className="btn" style={{ width: '100%' }} data-test-id="login-button">Login</button>
                </form>
            </div>
        </div>
    );
}
