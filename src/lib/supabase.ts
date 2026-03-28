import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fpsaoneawoudwxqmidwb.supabase.co';
const supabaseKey = 'sb_publishable_7fx53T2uev_Z59m8KOtwQA_10glCQ0f';

export const supabase = createClient(supabaseUrl, supabaseKey);
