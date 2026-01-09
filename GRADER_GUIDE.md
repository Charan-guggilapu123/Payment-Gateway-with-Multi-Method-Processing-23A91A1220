# QUICK START GUIDE FOR GRADERS

## One Command to Start Everything
```bash
docker-compose up -d --build
```

## Access Points
| Service | URL | Purpose |
|---------|-----|---------|
| API | http://localhost:8000/health | Backend API |
| Dashboard | http://localhost:3000 | Merchant portal |
| Checkout | http://localhost:3001 | Payment checkout |

## Test Credentials
- **API Key**: `key_test_abc123`
- **API Secret**: `secret_test_xyz789`
- **Dashboard Email**: `test@example.com` (any password)

## Quick Test Flow (3 Minutes)

### Step 1: Start Services
```bash
docker-compose up -d --build
# Wait 30 seconds for database to initialize
```

### Step 2: Test API
```bash
curl http://localhost:8000/health
# Expected: {"status":"ok"}
```

### Step 3: Create Order
```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789" \
  -d '{"amount":50000,"currency":"INR"}'
# Expected: {"id":"order_XXXXX", ...}
```

### Step 4: Open Checkout
```
http://localhost:3001/checkout?order_id=order_XXXXX
```

### Step 5: Complete Payment
1. Select "Card"
2. Enter: `4242424242424242` (card)
3. Enter: `12/25` (expiry)
4. Enter: `123` (CVV)
5. Enter: `John Doe` (name)
6. Click "Pay"

### Step 6: Verify Success
- Success page should display "Payment Successful!"
- Payment ID displayed

## Data-Test-IDs for Automated Testing

### Create Order Page
- `validation-error` - Error message banner

### Checkout Page (Payment)
- `checkout-container` - Main container
- `order-summary` - Order details
- `order-amount` - Payment amount
- `order-id` - Order ID
- `payment-methods` - Method selection
- `method-upi` - UPI button
- `method-card` - Card button
- `card-form` - Card input form
- `card-number-input` - Card number
- `expiry-input` - Expiry date
- `cvv-input` - CVV
- `cardholder-name-input` - Card holder name
- `pay-button` - Submit button
- `validation-error` - Validation error message
- `processing-state` - Processing spinner
- `success-state` - Success screen
- `payment-id` - Payment ID on success
- `error-state` - Error screen
- `retry-button` - Retry button

### Dashboard
- `login-form` - Login form
- `email-input` - Email field
- `login-button` - Login button
- `dashboard` - Main dashboard
- `api-credentials` - API key/secret display
- `api-key` - API key
- `api-secret` - API secret
- `stats-container` - Statistics section
- `total-transactions` - Transaction count
- `total-amount` - Total amount
- `success-rate` - Success percentage
- `transactions-table` - Payment transactions table
- `transaction-row` - Individual transaction row
- `payment-id` - Payment ID in table
- `order-id` - Order ID in table
- `amount` - Amount in table
- `method` - Payment method in table
- `status` - Payment status in table
- `created-at` - Creation date in table

## Validation Rules (Client + Server)

### UPI
- Format: `user@bank` (letters/numbers/dots/dashes at username, letters/numbers at bank)
- Error: "VPA format invalid"

### Card Number
- Luhn algorithm validation
- Length: 13-19 digits
- Error: "Card validation failed"

### Card Network Detection
- Visa: starts with 4
- Mastercard: starts with 51-55
- Amex: starts with 34 or 37
- Rupay: starts with 60, 65, or 81-89

### Expiry Date
- Format: MM/YY
- Month: 01-12
- Must not be in past
- Error: "Card expiry date invalid"

### CVV
- Length: 3-4 digits
- Error: "Enter a valid CVV"

## API Response Examples

### Create Order
```json
{
  "id": "order_abc123",
  "merchant_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 50000,
  "currency": "INR",
  "status": "created",
  "created_at": "2026-01-09T18:00:00.000Z"
}
```

### Create Payment
```json
{
  "id": "pay_xyz789",
  "order_id": "order_abc123",
  "amount": 50000,
  "currency": "INR",
  "method": "card",
  "status": "processing",
  "card_network": "visa",
  "card_last4": "4242",
  "created_at": "2026-01-09T18:00:00.000Z"
}
```

### Get Payment Status
```json
{
  "id": "pay_xyz789",
  "order_id": "order_abc123",
  "amount": 50000,
  "currency": "INR",
  "method": "card",
  "status": "success",
  "card_network": "visa",
  "card_last4": "4242",
  "created_at": "2026-01-09T18:00:00.000Z",
  "updated_at": "2026-01-09T18:00:05.000Z"
}
```

## Troubleshooting

### Port Already in Use
```bash
lsof -i :8000
lsof -i :3000
lsof -i :3001
# Kill processes and try again
```

### Services Won't Start
```bash
docker-compose down -v
docker-compose up -d --build
```

### Check Logs
```bash
docker-compose logs api
docker-compose logs dashboard
docker-compose logs checkout
docker-compose logs postgres
```

### Database Connection Error
```bash
docker-compose logs postgres
# Verify healthcheck passes
docker-compose ps
```

## Performance Notes

- **Database Initialization**: ~5-10 seconds
- **API Response Time**: <100ms
- **Payment Processing**: 1-10 seconds (1 second in test mode)
- **Frontend Load**: <2 seconds

## Files to Review

1. **docker-compose.yml** - Service configuration
2. **backend/src/validators/validation.js** - Validation logic
3. **backend/src/controllers/paymentController.js** - Payment processing
4. **checkout-page/src/pages/Checkout.jsx** - Client-side validation
5. **README.md** - Setup documentation

---

**Expected Total Test Time**: 5-10 minutes
**Automated Test Points**: 50+
**Manual Verification**: Dashboard, Checkout UI, Data-test-ids
