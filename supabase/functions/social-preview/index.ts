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
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response('Missing ID', { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Fetch need details
    const { data: need, error } = await supabase
      .from('needs')
      .select('*, profiles!needs_user_id_fkey(display_name, username)')
      .eq('id', id)
      .single();

    if (error || !need) {
      console.error('Error fetching need:', error);
      // Return a basic 404 page or redirect to home
      return new Response('Need not found', { status: 404 });
    }

    const title = `${need.title} | Ineedam`;
    const description = need.description || 'Connecting real needs with real solutions.';
    const imageUrl = need.image_url || 'https://ineedam.com/og-image.png';
    const appUrl = `https://ineedam.com/need/${id}`;
    const authorName = need.profiles?.display_name || 'Someone';

    // HTML response with meta tags and redirect
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    
    <!-- Standard Meta Tags -->
    <meta name="description" content="${description}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${appUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:site_name" content="Ineedam">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${appUrl}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">

    <!-- Redirect to App -->
    <meta http-equiv="refresh" content="0;url=${appUrl}">
    <script>
        window.location.href = "${appUrl}";
    </script>
</head>
<body>
    <p>Redirecting to <a href="${appUrl}">${title}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (err) {
    console.error('social-preview error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
});
