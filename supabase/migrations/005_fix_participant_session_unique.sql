-- Fix participants unique constraint to allow sessions across different rooms  
ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_session_token_key;  
  
DO   
BEGIN  
  IF NOT EXISTS (  
    SELECT 1 FROM pg_constraint WHERE conname = 'participants_room_session_unique'  
  ) THEN  
    ALTER TABLE participants ADD CONSTRAINT participants_room_session_unique UNIQUE (room_id, session_token);  
  END IF;  
END ; 
