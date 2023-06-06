import { PUBLIC_API_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

export function GET() {
  const data = {
    'url': PUBLIC_API_URL,
  }

	return json(data);
}
