import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const [merchant, setMerchant] = useState(null);
    const [stats, setStats] = useState({ total: 0, amount: 0, successRate: 0 });

    useEffect(() => {
        fetch('http://localhost:8000/api/v1/test/merchant')
            .then(res => res.json())
            .then(data => {
                setMerchant(data);
                fetchPayments(data.api_key, data.api_secret);
            });
    }, []);

    const fetchPayments = (key, secret) => {
        fetch('http://localhost:8000/api/v1/payments', {
            headers: {
                'X-Api-Key': key,
                'X-Api-Secret': secret
            }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const total = data.length;
                    const success = data.filter(p => p.status === 'success');
                    const amount = success.reduce((sum, p) => sum + p.amount, 0);
                    const rate = total > 0 ? Math.round((success.length / total) * 100) : 0;

                    setStats({
                        total,
                        amount,
                        successRate: rate
                    });
                }
            });
    };

    const formatCurrency = (paise) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);
    };

    if (!merchant) return <div>Loading...</div>;

    return (
        <div className="container" data-test-id="dashboard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Dashboard</h1>
                <Link to="/dashboard/transactions" className="btn">View Transactions</Link>
            </div>

            <div className="card" data-test-id="api-credentials" style={{ marginBottom: '2rem' }}>
                <h3>API Credentials</h3>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)' }}>API Key</label>
                        <span data-test-id="api-key" style={{ fontFamily: 'monospace' }}>{merchant.api_key}</span>
                    </div>
                    <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)' }}>API Secret</label>
                        <span data-test-id="api-secret" style={{ fontFamily: 'monospace' }}>{merchant.api_secret}</span>
                    </div>
                </div>
            </div>

            <div className="card" data-test-id="stats-container">
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }} data-test-id="total-transactions">{stats.total}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>Total Transactions</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }} data-test-id="total-amount">
                            {formatCurrency(stats.amount)}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>Total Volume</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }} data-test-id="success-rate">{stats.successRate}%</div>
                        <div style={{ color: 'var(--text-secondary)' }}>Success Rate</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
