/* eslint-disable @typescript-eslint/no-require-imports */
// Explicit integration check: creates and removes only its own temporary client.
const { createClient } = require('@supabase/supabase-js');
const assert = require('node:assert/strict');
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const id = `test-logo-${crypto.randomUUID()}`;
const logo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5N8AAAAASUVORK5CYII=';
(async () => {
  try {
    const inserted = await s.from('sem_clients').insert({id,name:'Temporary logo integration test',slug:id,logo_url:logo});
    if (inserted.error) throw inserted.error;
    const read = await s.from('sem_clients').select('logo_url').eq('id',id).single();
    if (read.error) throw read.error;
    assert.equal(read.data.logo_url,logo);
    const updated = await s.from('sem_clients').update({logo_url:null}).eq('id',id).select('logo_url').single();
    if (updated.error) throw updated.error;
    assert.equal(updated.data.logo_url,null);
    console.log('PASS: logo round-trip and removal in Supabase');
  } finally {
    const cleanup = await s.from('sem_clients').delete().eq('id',id);
    if (cleanup.error) throw cleanup.error;
    const remaining = await s.from('sem_clients').select('id').eq('id',id);
    if (remaining.error) throw remaining.error;
    assert.equal(remaining.data.length,0);
    console.log('PASS: temporary record removed');
  }
})().catch(error => { console.error(error.message); process.exitCode=1; });
