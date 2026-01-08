import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_BASE } from '../config/api';

export default function Checkout() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('order_id');

    const [order, setOrder] = useState(null);
    const [method, setMethod] = useState(null);

    const [vpa, setVpa] = useState('');
    const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });

    const [step, setStep] = useState('summary'); // summary, processing, success, error
    const [paymentId, setPaymentId] = useState(null);

    useEffect(() => {
        if (orderId) {
            fetch(`${API_BASE}/api/v1/orders/${orderId}/public`)
                .then(res => {
                    if (!res.ok) throw new Error('Order not found');
                    return res.json();
                })
                .then(data => setOrder(data))
                .catch(err => {
                    console.error(err);
                    // Handle error, maybe show error state or alert
                });
        }
    }, [orderId]);

    const handlePayment = (e) => {
        e.preventDefault();
        setStep('processing');

        const payload = {
            order_id: orderId,
            method,
        };

        if (method === 'upi') {
            payload.vpa = vpa;
        } else {
            const [month, year] = card.expiry.split('/');
            payload.card = {
                number: card.number,
                expiry_month: month,
                expiry_year: year,
                cvv: card.cvv,
                holder_name: card.name
            };
        }

        fetch(`${API_BASE}/api/v1/payments/public`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setStep('error');
                } else {
                    setPaymentId(data.id);
                    pollStatus(data.id); // Note: Should probably clear interval on unmount
                }
            })
            .catch(() => setStep('error'));
    };

    const pollStatus = (pid) => {
        const interval = setInterval(() => {
            fetch(`${API_BASE}/api/v1/payments/${pid}/public`)
                .then(res => res.json())
                .then(p => {
                    if (p.status === 'success') {
                        clearInterval(interval);
                        setStep('success');
                    } else if (p.status === 'failed') {
                        clearInterval(interval);
                        setStep('error');
                    }
                });
        }, 2000);
    };

    const formatCurrency = (paise) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);
    };

    if (!order) return <div className="container" style={{ color: 'white' }}>Loading Order...</div>;

    return (
        <div className="container" data-test-id="checkout-container">
            {step === 'summary' || step === 'processing' ? (
                <>
                    <div className="card" data-test-id="order-summary" style={{ marginBottom: '2rem' }}>
                        <h2>Complete Payment</h2>
                        <div>
                            <span>Amount: </span>
                            <span data-test-id="order-amount" style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>{formatCurrency(order.amount)}</span>
                        </div>
                        <div>
                            <span>Order ID: </span>
                            <span data-test-id="order-id" style={{ fontFamily: 'monospace' }}>{order.id}</span>
                        </div>
                    </div>

                    {step === 'processing' ? (
                        <div data-test-id="processing-state" style={{ textAlign: 'center', padding: '2rem' }}>
                            <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }}></div>
                            <style>{`@keyframes spin {0% {transform: rotate(0deg);} 100% {transform: rotate(360deg);}}`}</style>
                            <span data-test-id="processing-message">Processing payment...</span>
                        </div>
                    ) : (
                        <>
                            <div data-test-id="payment-methods" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                                <button
                                    className="btn"
                                    style={{ background: method === 'upi' ? 'var(--primary-dark)' : 'var(--bg-card)', border: '1px solid var(--primary)' }}
                                    data-test-id="method-upi"
                                    data-method="upi"
                                    onClick={() => setMethod('upi')}
                                >
                                    UPI
                                </button>
                                <button
                                    className="btn"
                                    style={{ background: method === 'card' ? 'var(--primary-dark)' : 'var(--bg-card)', border: '1px solid var(--primary)' }}
                                    data-test-id="method-card"
                                    data-method="card"
                                    onClick={() => setMethod('card')}
                                >
                                    Card
                                </button>
                            </div>

                            {method === 'upi' && (
                                <form data-test-id="upi-form" onSubmit={handlePayment}>
                                    <input
                                        className="input"
                                        data-test-id="vpa-input"
                                        placeholder="username@bank"
                                        type="text"
                                        onChange={e => setVpa(e.target.value)}
                                        required
                                    />
                                    <button data-test-id="pay-button" type="submit" className="btn" style={{ width: '100%' }}>
                                        Pay {formatCurrency(order.amount)}
                                    </button>
                                </form>
                            )}

                            {method === 'card' && (
                                <form data-test-id="card-form" onSubmit={handlePayment}>
                                    <input
                                        className="input"
                                        data-test-id="card-number-input"
                                        placeholder="Card Number"
                                        type="text"
                                        onChange={e => setCard({ ...card, number: e.target.value })}
                                        required
                                    />
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <input
                                            className="input"
                                            data-test-id="expiry-input"
                                            placeholder="MM/YY"
                                            type="text"
                                            onChange={e => setCard({ ...card, expiry: e.target.value })}
                                            required
                                        />
                                        <input
                                            className="input"
                                            data-test-id="cvv-input"
                                            placeholder="CVV"
                                            type="text"
                                            onChange={e => setCard({ ...card, cvv: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <input
                                        className="input"
                                        data-test-id="cardholder-name-input"
                                        placeholder="Name on Card"
                                        type="text"
                                        onChange={e => setCard({ ...card, name: e.target.value })}
                                        required
                                    />
                                    <button data-test-id="pay-button" type="submit" className="btn" style={{ width: '100%' }}>
                                        Pay {formatCurrency(order.amount)}
                                    </button>
                                </form>
                            )}
                        </>
                    )}
                </>
            ) : null}

            {step === 'success' && (
                <div data-test-id="success-state" className="card" style={{ textAlign: 'center', borderColor: 'var(--success)' }}>
                    <h2 style={{ color: 'var(--success)' }}>Payment Successful!</h2>
                    <div>
                        <span>Payment ID: </span>
                        <span data-test-id="payment-id" style={{ fontFamily: 'monospace' }}>{paymentId}</span>
                    </div>
                    <span data-test-id="success-message">
                        Your payment has been processed successfully
                    </span>
                </div>
            )}

            {step === 'error' && (
                <div data-test-id="error-state" className="card" style={{ textAlign: 'center', borderColor: '#ef4444' }}>
                    <h2 style={{ color: '#ef4444' }}>Payment Failed</h2>
                    <span data-test-id="error-message" style={{ display: 'block', marginBottom: '1rem' }}>
                        Payment could not be processed
                    </span>
                    <button data-test-id="retry-button" className="btn" onClick={() => setStep('summary')}>Try Again</button>
                </div>
            )}
        </div>
    );
}
