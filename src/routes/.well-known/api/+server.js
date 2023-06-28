import { PUBLIC_API_URL, PUBLIC_MEDIA_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

export function GET() {
  const data = {
    'url': PUBLIC_API_URL,
    'media_url': PUBLIC_MEDIA_URL,
  }

	return json(data);
}
