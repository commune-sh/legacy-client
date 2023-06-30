import { PUBLIC_API_URL } from '$env/static/public';
import { processFeed } from '$lib/utils/utils.js';

export async function GET({params}) {

  const res = await fetch(`${PUBLIC_API_URL}/${params.space}/${params.room}/events?topic=${params.topic}`);
  const data = await res.json();

  const feed = processFeed(data?.events);

  return new Response(feed, {
		headers: {
			'Cache-Control': `max-age=0, s-max-age=${600}`, // 10 minutes
			'Content-Type': 'application/rss+xml'
		}
	});
}


