import { PUBLIC_MATRIX_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

export function GET() {
  const data = {
    'm.server': PUBLIC_MATRIX_URL,
  }

	return json(data);
}
