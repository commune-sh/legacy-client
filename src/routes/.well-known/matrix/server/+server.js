import { PUBLIC_MATRIX_DELEGATION_SERVER } from '$env/static/public';
import { json } from '@sveltejs/kit';

export function GET() {
  const data = {
    'm.server': PUBLIC_MATRIX_DELEGATION_SERVER
  }

	return json(data);
}
