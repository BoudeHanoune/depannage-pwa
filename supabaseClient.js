import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ixdnmynxetysugycgeig.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4ZG5teW54ZXR5c3VneWNnZWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MDIyNDksImV4cCI6MjA4ODA3ODI0OX0.L06twSE3M-az3eKFFDXPiMzjgu8Bfv5ML0rqqDYg8bk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);