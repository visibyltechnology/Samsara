import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nfsptdkgxemxznyevjdz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2O-Lv0UDdfs3aqAX3UJv-g_s9eEibPG';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
