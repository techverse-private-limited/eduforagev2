-- Add tutor_response column to support_tickets table
ALTER TABLE support_tickets 
ADD COLUMN tutor_response TEXT;

-- Enable realtime for support_tickets table
ALTER TABLE support_tickets REPLICA IDENTITY FULL;

-- Add support_tickets to realtime publication
INSERT INTO supabase_realtime.schema_migrations (version, inserted_at) 
VALUES ('20241230000001', NOW())
ON CONFLICT (version) DO NOTHING;

-- Enable realtime for notifications table as well
ALTER TABLE notifications REPLICA IDENTITY FULL;