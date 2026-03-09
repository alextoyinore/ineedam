import { createClient } from '@supabase/supabase-js';

const url = 'https://owlkmvgpuzwnpaqigfuf.supabase.co';
const anon = 'sb_publishable_r0kouvyQVn5fxMDmTQfbDA_v8_7IDE3';
const supabase = createClient(url, anon);

const sql1 = `
  CREATE POLICY IF NOT EXISTS "Users can delete their own messages"
  ON public.messages FOR DELETE USING (auth.uid() = sender_id);
`;
const sql2 = `
  CREATE POLICY IF NOT EXISTS "Users can update their own messages"
  ON public.messages FOR UPDATE 
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);
`;

const { error: e1 } = await supabase.rpc('exec', { sql: sql1 }).catch(e => ({ error: e }));
console.log('Policy 1:', e1 || 'OK');
const { error: e2 } = await supabase.rpc('exec', { sql: sql2 }).catch(e => ({ error: e }));
console.log('Policy 2:', e2 || 'OK');
