import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LinkPreview {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  favicon: string | null;
  siteName: string | null;
}

function extractMeta(html: string, url: string): LinkPreview {
  const getMetaContent = (name: string): string | null => {
    const patterns = [
      new RegExp(`<meta[^>]+property=["']og:${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${name}["']`, 'i'),
      new RegExp(`<meta[^>]+name=["']twitter:${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:${name}["']`, 'i'),
    ];
    for (const p of patterns) {
      const m = html.match(p);
      if (m?.[1]) return m[1].trim();
    }
    return null;
  };

  const getTitle = (): string | null => {
    const og = getMetaContent('title');
    if (og) return og;
    const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return m?.[1]?.trim() || null;
  };

  const getFavicon = (base: string): string | null => {
    const m = html.match(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/i)
      || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*icon[^"']*["']/i);
    if (!m?.[1]) return `${base}/favicon.ico`;
    const href = m[1];
    if (href.startsWith('http')) return href;
    if (href.startsWith('//')) return `https:${href}`;
    if (href.startsWith('/')) return `${base}${href}`;
    return `${base}/${href}`;
  };

  const urlObj = new URL(url);
  const base = `${urlObj.protocol}//${urlObj.host}`;

  return {
    url,
    title: getTitle(),
    description: getMetaContent('description'),
    image: getMetaContent('image'),
    favicon: getFavicon(base),
    siteName: getMetaContent('site_name') || urlObj.hostname.replace('www.', ''),
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid URL' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('Invalid protocol');
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch URL', status: response.status }), {
        status: 200, // Return 200 so frontend doesn't crash — it just won't show a preview
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      // For direct image/video links, return basic preview
      return new Response(JSON.stringify({
        url,
        title: parsedUrl.pathname.split('/').pop() || url,
        description: null,
        image: contentType.startsWith('image/') ? url : null,
        favicon: null,
        siteName: parsedUrl.hostname.replace('www.', ''),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Read only the first 50KB to avoid downloading huge pages
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No reader');
    
    let html = '';
    let totalBytes = 0;
    const MAX_BYTES = 50000;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      html += new TextDecoder().decode(value);
      totalBytes += value?.length || 0;
      if (totalBytes >= MAX_BYTES) {
        reader.cancel();
        break;
      }
    }

    const preview = extractMeta(html, url);

    return new Response(JSON.stringify(preview), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('link-preview error:', err);
    return new Response(JSON.stringify({ error: 'Preview unavailable' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
