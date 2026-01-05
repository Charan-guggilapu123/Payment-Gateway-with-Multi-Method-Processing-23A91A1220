import { useEffect, useState } from 'react';

export default function Transactions() {
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8000/api/v1/test/merchant')
            .then(res => res.json())
            .then(merchant => {
                fetch('http://localhost:8000/api/v1/payments', {
                    headers: {
                        'X-Api-Key': merchant.api_key,
                        'X-Api-Secret': merchant.api_secret
                    }
                })
                    .then(res => res.json())
                    .then(data => setPayments(data));
            });
    }, []);

    return (
        <div className="container">
            <h1>Transactions</h1>
            <div className="card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }} data-test-id="transactions-table">
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem' }}>Payment ID</th>
                            <th style={{ padding: '1rem' }}>Order ID</th>
                            <th style={{ padding: '1rem' }}>Amount</th>
                            <th style={{ padding: '1rem' }}>Method</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(p => (
                            <tr key={p.id} data-test-id="transaction-row" data-payment-id={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem' }} data-test-id="payment-id">{p.id}</td>
                                <td style={{ padding: '1rem' }} data-test-id="order-id">{p.order_id}</td>
                                <td style={{ padding: '1rem' }} data-test-id="amount">{p.amount}</td>
                                <td style={{ padding: '1rem' }} data-test-id="method">{p.method}</td>
                                <td style={{ padding: '1rem' }} data-test-id="status">
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem',
                                        backgroundColor: p.status === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                        color: p.status === 'success' ? '#22c55e' : '#ef4444'
                                    }}>
                                        {p.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }} data-test-id="created-at">{new Date(p.created_at).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
