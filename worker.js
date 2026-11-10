export default {
  fetch(request, env) {
    // Matching files are served by Cloudflare before this Worker runs.
    const pathname = decodeURIComponent(new URL(request.url).pathname);
    const basename = pathname.slice(pathname.lastIndexOf('/') + 1);
    if (basename.lastIndexOf('.') > 0) {
      return new Response('Not found', { status: 404 });
    }
    return env.ASSETS.fetch(new URL('/index.html', request.url));
  }
};
