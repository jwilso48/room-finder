const ALLOWED_ORIGINS = ['*'];

const ALLOWED_URLS = [
  'https://www.reddit.com/r/NYCroommates/new.json',
  'https://www.reddit.com/r/nycapartments/new.json',
  'https://newyork.craigslist.org/search/roo',
  'https://newyork.craigslist.org/search/brk/roo',
  'https://newyork.craigslist.org/search/que/roo',
  'https://www.spareroom.com/flatshare',
];

function isAllowed(url) {
  return ALLOWED_URLS.some(allowed => url.startsWith(allowed));
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    const url = new URL(request.url);
    const target = url.searchParams.get('url');

    if (!target) {
      return new Response(JSON.stringify({ error: 'Missing url param' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    if (!isAllowed(target)) {
      return new Response(JSON.stringify({ error: 'URL not allowed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    try {
      const response = await fetch(target, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; room-finder/1.0)',
          'Accept': 'application/json, text/xml, */*',
        }
      });

      const contentType = response.headers.get('content-type') || '';
      const body = await response.text();

      return new Response(body, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300',
        }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};

