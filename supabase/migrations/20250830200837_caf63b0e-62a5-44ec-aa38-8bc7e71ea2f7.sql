-- Add tutor_response column to support_tickets table
ALTER TABLE support_tickets 
ADD COLUMN tutor_response TEXT;

-- Enable realtime for support_tickets table
ALTER TABLE support_tickets REPLICA IDENTITY FULL;

-- Add support_tickets to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;

-- Enable realtime for notifications table as well
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- Add notifications to realtime publication  
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;