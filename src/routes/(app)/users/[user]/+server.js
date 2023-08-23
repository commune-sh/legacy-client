import { PUBLIC_BASE_URL} from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export function GET({ params, request }) {
  const accept = request.headers.get('accept') || '';
  const isHTML = accept.includes('text/html');
  const isAPI = accept.includes(`application/ld+json; profile="https://www.w3.org/ns/activitystreams"`) ||
  accept.includes('application/activity+json');

  if(isHTML) {

    throw redirect(307, `${PUBLIC_BASE_URL}/@${params.user}`);

  } else if(isAPI) {

    const data = {
      'data': ''
    }

    return json(data);
  }
}
