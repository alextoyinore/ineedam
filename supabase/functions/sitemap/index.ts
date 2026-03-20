import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 1. Fetch Needs
    const { data: needs } = await supabase
      .from('needs')
      .select('id, updated_at')
      .neq('status', 'archived')
      .order('created_at', { ascending: false })
      .limit(1000);

    // 2. Fetch Profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('username, updated_at')
      .not('username', 'is', null)
      .limit(500);

    const baseUrl = 'https://ineedam.com';

    // Static pages
    const staticPages = [
      '',
      '/explore',
      '/about',
      '/faq',
      '/how-to-use',
      '/rules',
      '/privacy',
      '/terms',
      '/contact'
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    staticPages.forEach(path => {
      xml += `
  <url>
    <loc>${baseUrl}${path}</loc>
    <changefreq>daily</changefreq>
    <priority>${path === '' ? '1.0' : '0.8'}</priority>
  </url>`;
    });

    // Add Needs
    needs?.forEach(need => {
      xml += `
  <url>
    <loc>${baseUrl}/need/${need.id}</loc>
    <lastmod>${new Date(need.updated_at || Date.now()).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // Add Profiles
    profiles?.forEach(profile => {
      xml += `
  <url>
    <loc>${baseUrl}/${profile.username}</loc>
    <lastmod>${new Date(profile.updated_at || Date.now()).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });

  } catch (err) {
    console.error('sitemap error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
});
