import { PUBLIC_API_URL, PUBLIC_BASE_URL, PUBLIC_APP_NAME } from '$env/static/public';

const render = (items) => `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
<title>${PUBLIC_APP_NAME}</title>
<link>${PUBLIC_BASE_URL}/rss</link>
<description>${PUBLIC_APP_NAME} RSS feed</description>
<image>
<url>${PUBLIC_BASE_URL}/favicon.png</url>
<title>${PUBLIC_APP_NAME}</title>
<link>${PUBLIC_BASE_URL}/rss</link>
</image>
${items
.map(
(item) => `
<item>
<title>${item.content.title}</title>
<description>${item.content.body}</description>
<link>${PUBLIC_BASE_URL}/${item.room_alias}/post/${item.slug}</link>
</item>
`
)
.join('')}
</channel>
</rss>`;

export async function GET() {

  const res = await fetch(`${PUBLIC_API_URL}/events`);
  const data = await res.json();


  const feed = render(data?.events);

  return new Response(feed, {
		headers: {
			'Cache-Control': `max-age=0, s-max-age=${600}`, // 10 minutes
			'Content-Type': 'application/rss+xml'
		}
	});
}
