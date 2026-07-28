-- DB initialization for GG Gadgets (sample objects used by models)
-- Run this in pgAdmin Query Tool against your database

CREATE SCHEMA IF NOT EXISTS GS_schema;

-- Customers table
CREATE TABLE IF NOT EXISTS GS_schema.customers (
    id SERIAL PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    metadata JSONB,
    archived BOOLEAN DEFAULT FALSE
);

-- View expected by customers.model.getAllCustomers
CREATE OR REPLACE VIEW GS_schema.api_customer_profile_vu AS
SELECT row_to_json(c.*) AS customer
FROM GS_schema.customers c
WHERE c.archived = FALSE;

-- Stored procedures used in customers.model
CREATE OR REPLACE FUNCTION GS_schema.sp_get_customer_by_id(p_id INT)
RETURNS JSONB AS $$
BEGIN
    RETURN (SELECT row_to_json(t) FROM (SELECT id, full_name, email, phone, metadata FROM GS_schema.customers WHERE id = p_id AND archived = FALSE) t);
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION GS_schema.sp_create_customer(p_full_name TEXT, p_email TEXT, p_phone TEXT, p_metadata JSONB)
RETURNS INT AS $$
DECLARE r INT;
BEGIN
    INSERT INTO GS_schema.customers(full_name, email, phone, metadata) VALUES (p_full_name, p_email, p_phone, p_metadata) RETURNING id INTO r;
    RETURN r;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION GS_schema.sp_update_customer(p_id INT, p_full_name TEXT, p_email TEXT, p_phone TEXT, p_metadata JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE GS_schema.customers SET full_name = p_full_name, email = p_email, phone = p_phone, metadata = p_metadata WHERE id = p_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION GS_schema.sp_archive_customer(p_id INT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE GS_schema.customers SET archived = TRUE WHERE id = p_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- You can add sample data
INSERT INTO GS_schema.customers (full_name, email, phone, metadata)
VALUES ('Alice Example', 'alice@example.com', '1234567890', '{}'::jsonb)
ON CONFLICT DO NOTHING;
