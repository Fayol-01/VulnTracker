import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rsgbbkyiktkmkqcqirpy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZ2Jia3lpa3RrbWtxY3FpcnB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNDYwMjYsImV4cCI6MjA3MzkyMjAyNn0.9CWQxDvVOV59urjFjpSfva9n4oY_iP61mvayiRltRsk';

export const supabase = createClient(supabaseUrl, supabaseKey);