import { PUBLIC_BASE_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

export function GET({ url }) {
  let resource = url.searchParams.get('resource');

  let user = resource.replace('acct:', '');

  let localpart = user.split('@')[0];
  let domain = user.split('@')[1];

  let direct_alias = `${PUBLIC_BASE_URL}/@${localpart}`;
  let alt_alias = `${PUBLIC_BASE_URL}/users/${localpart}`;

  const data = {
    'subject': resource,
    'aliases': [direct_alias, alt_alias],
    'links': [
      {
        'rel': 'http://webfinger.net/rel/profile-page',
        'type': 'text/html',
        'href': `${PUBLIC_BASE_URL}/@${localpart}`
      },
      {
        'rel': 'self',
        'type': 'application/activity+json',
        'href': `${PUBLIC_BASE_URL}/users/${localpart}`
      },
      {
        'rel': 'http://ostatus.org/schema/1.0/subscribe',
        'template': `${PUBLIC_BASE_URL}/authorize_interaction?uri={uri}`
      }]
  }

	return json(data);
}
