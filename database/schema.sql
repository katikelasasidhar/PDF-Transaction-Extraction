-- Drop existing tables if they exist
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create transactions table with more fields
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  serial_no VARCHAR(10),
  buyer VARCHAR(255),
  seller VARCHAR(255),
  house_no VARCHAR(100),
  survey_no VARCHAR(100),
  document_no VARCHAR(100),
  transaction_date DATE,
  value BIGINT,
  market_value BIGINT,
  property_extent VARCHAR(100),
  property_type VARCHAR(100),
  village VARCHAR(100),
  nature VARCHAR(100),
  pdf_filename VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller);
CREATE INDEX IF NOT EXISTS idx_transactions_survey_no ON transactions(survey_no);
CREATE INDEX IF NOT EXISTS idx_transactions_document_no ON transactions(document_no);
CREATE INDEX IF NOT EXISTS idx_transactions_house_no ON transactions(house_no);

-- Insert a demo user
INSERT INTO users (username, email, password) 
VALUES ('demo', 'demo@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi') 
ON CONFLICT (username) DO NOTHING;
-- Password is 'demo123'