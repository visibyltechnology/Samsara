const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://nfsptdkgxemxznyevjdz.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mc3B0ZGtneGVteHpueWV2amR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDYxNjM2OCwiZXhwIjoyMTA2MTkyMzY4fQ.EhgujpFN1pclEuKfVsRJaHY1aO7ABhocpLsu5-XIuLM';
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function run() {
  const ids = [
    '7315d330-368c-48e8-85d4-b00a223613c8',
    'f414effd-1fae-4d84-8925-a9c4cc4377c2',
    '84a847d5-e8c9-40e9-89f6-5b0f3b276031'
  ];
  
  for (const id of ids) {
    const { data, error } = await supabase.from('categories').update({ is_bundle: true }).eq('id', id);
    if (error) {
      console.error('Failed to update', id, error);
    } else {
      console.log('Successfully updated', id);
    }
  }
}
run();
