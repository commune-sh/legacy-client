import { PUBLIC_MATRIX_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

let stripped = PUBLIC_MATRIX_URL.replace('https://', '');

export function GET() {
  const data = {
    'm.server': `${stripped}:443`,
  }

	return json(data);
}