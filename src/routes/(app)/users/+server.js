import { PUBLIC_BASE_URL} from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export function GET() {
    throw redirect(307, `${PUBLIC_BASE_URL}`);
}
