-- Create payments table for storing M-Pesa payment details
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    merchant_request_id TEXT,
    checkout_request_id TEXT,
    response_code TEXT,
    response_description TEXT,
    customer_message TEXT,
    result_code TEXT,
    result_desc TEXT,
    callback_metadata JSONB,
    mpesa_receipt_number TEXT,
    transaction_date TIMESTAMP WITH TIME ZONE,
    phone_number TEXT,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    payment_method TEXT DEFAULT 'mpesa',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Indexes for better performance
    INDEX idx_payments_order_id (order_id),
    INDEX idx_payments_checkout_request_id (checkout_request_id),
    INDEX idx_payments_mpesa_receipt_number (mpesa_receipt_number),
    INDEX idx_payments_status (status),
    INDEX idx_payments_created_at (created_at),

    -- Constraints
    UNIQUE(order_id, checkout_request_id),
    CHECK (amount > 0)
);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payments_updated_at_trigger
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_payments_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to view their own payments
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders WHERE customer_id = auth.uid()
        )
    );

-- Policy for admin users to view all payments
CREATE POLICY "Admins can view all payments" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM customers
            WHERE customers.id = auth.uid()
            AND customers.role IN ('admin', 'super_admin')
        )
    );

-- Comments for documentation
COMMENT ON TABLE payments IS 'Stores M-Pesa payment transaction details for orders';
COMMENT ON COLUMN payments.merchant_request_id IS 'M-Pesa merchant request ID from STK push initiation';
COMMENT ON COLUMN payments.checkout_request_id IS 'M-Pesa checkout request ID for tracking transaction';
COMMENT ON COLUMN payments.response_code IS 'Initial response code from M-Pesa API';
COMMENT ON COLUMN payments.response_description IS 'Description of the initial response';
COMMENT ON COLUMN payments.customer_message IS 'Message displayed to customer during STK push';
COMMENT ON COLUMN payments.result_code IS 'Final result code from M-Pesa callback';
COMMENT ON COLUMN payments.result_desc IS 'Description of the final result';
COMMENT ON COLUMN payments.callback_metadata IS 'JSON metadata from M-Pesa callback';
COMMENT ON COLUMN payments.mpesa_receipt_number IS 'M-Pesa transaction receipt number';
COMMENT ON COLUMN payments.transaction_date IS 'Date and time of the transaction';
COMMENT ON COLUMN payments.phone_number IS 'Customer phone number used for payment';
COMMENT ON COLUMN payments.amount IS 'Payment amount in KES';
COMMENT ON COLUMN payments.status IS 'Payment status: pending, processing, completed, failed, cancelled';