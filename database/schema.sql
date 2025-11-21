-- Create links table
CREATE TABLE IF NOT EXISTS links (
    id SERIAL PRIMARY KEY,
    code VARCHAR(8) UNIQUE NOT NULL,
    long_url TEXT NOT NULL,
    total_clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    last_clicked TIMESTAMP
);

-- Create index on code column for faster lookups
CREATE INDEX IF NOT EXISTS idx_links_code ON links(code);