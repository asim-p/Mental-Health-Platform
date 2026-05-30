# eSewa ePay-v2 Testing Guide

This guide provides step-by-step instructions for testing the eSewa ePay-v2 integration in the sandbox environment.

## 1. Prerequisites
- Ensure both the frontend and backend servers are running.
- Ensure you have a patient account registered and logged in on the platform.

## 2. Test Credentials
Use the following sandbox credentials to simulate a payment.

**Merchant Credentials (used by backend)**
- Merchant ID/Service Code: `EPAYTEST`
- Secret Key: `8gBm/:&EnhH.1/q`

**Customer Credentials (used during checkout)**
- eSewa ID: `9806800002` (or `9806800003`, `9806800004`, `9806800005`)
- Password: `Nepal@123`
- MPIN: `1122`
- Token: `123456`

## 3. Testing the Happy Path (Successful Payment)
1. Navigate to the **Therapist Directory** and select a therapist.
2. Choose an available date and time slot.
3. Click the **"Confirm & Pay"** button.
4. You should be automatically redirected to the **eSewa sandbox payment portal** (`rc-epay.esewa.com.np`).
5. Login using the **Customer Credentials** listed above.
6. Review the payment details and confirm the payment.
7. Upon success, you will be redirected back to the platform's `/payment/success` page.
8. Wait for the platform to verify the transaction. You should see a "Payment Successful" message.
9. You will be redirected to the Patient Dashboard. Check that your new appointment appears with a `CONFIRMED` status.

## 4. Testing the Unhappy Path (Failed/Cancelled Payment)
1. Repeat steps 1-4 from the Happy Path.
2. Once on the eSewa sandbox payment portal, instead of logging in, click **"Cancel"** or close the eSewa window.
3. If clicking cancel, you should be redirected back to the platform's `/payment/failure` page.
4. The page should inform you that the payment was cancelled/failed.
5. Check your Patient Dashboard. The appointment should either not appear or appear with a `PENDING`/`CANCELLED` status depending on your data retention policy for failed attempts.

## 5. Troubleshooting
- **Signature Errors on eSewa page:** Check that the `amount` passed matches exactly what was used to generate the signature in the backend. Ensure `EPAYTEST` and the secret key are correctly configured in `backend/src/routes/payments.js`.
- **"Transaction not found" on success redirect:** Verify that the backend is successfully decoding the base64 `data` query parameter and finding the `transaction_uuid` in the local `payments` database collection.
