// Static asset matches bypass this Worker. Only missing extensionless paths use the app shell.
export default {
  async fetch(request, env) {
    const pathname = new URL(request.url).pathname;
    const finalSegment = pathname.slice(pathname.lastIndexOf('/') + 1);
    if (finalSegment.includes('.')) {
      return new Response('Not found', { status: 404 });
    }

    const index = await env.ASSETS.fetch(new URL('/index.html', request.url));
    const headers = new Headers(index.headers);
    headers.set('Cache-Control', 'no-cache');
    return new Response(index.body, { status: index.status, headers });
  },
};
