import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nfsptdkgxemxznyevjdz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mc3B0ZGtneGVteHpueWV2amR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDYxNjM2OCwiZXhwIjoyMTA2MTkyMzY4fQ.EhgujpFN1pclEuKfVsRJaHY1aO7ABhocpLsu5-XIuLM';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const ADMIN_EMAILS = ['samsarachoice1@gmail.com', 'macchristar.ng@gmail.com'];

const { data: users } = await supabase.auth.admin.listUsers();

for (const email of ADMIN_EMAILS) {
  let user = users.users.find(u => u.email === email);
  if (!user) {
    // Create if not exists
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email,
      password: email === 'macchristar.ng@gmail.com' ? 'Admin@01' : '@samsarachoice1Visibyl',
      email_confirm: true,
    });
    if (error) console.log(`Error creating ${email}:`, error.message);
    else console.log(`✅ Created + confirmed: ${email}`);
  } else {
    const { error } = await supabase.auth.admin.updateUserById(user.id, { email_confirm: true });
    if (error) console.log(`Error confirming ${email}:`, error.message);
    else console.log(`✅ Confirmed: ${email}`);
  }
}
