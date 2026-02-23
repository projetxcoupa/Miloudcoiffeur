import { createClient } from '@/utils/supabase/client';

export const supabase = createClient();
export const isConfigured = true; // Assumed true if we're using the new utility which handles mocking check internally
