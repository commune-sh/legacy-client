import { PUBLIC_API_URL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutLoad} */
export async function load( { fetch, params, url, cookies, request } ) {

  let hasToken = false;
  let token = cookies.get('token');
  if(token) {
    hasToken = true;
  }
  if (!token) {
    throw redirect(307, '/login');
  }

  let data = {token:token}

  if(hasToken) {
    let u = `${PUBLIC_API_URL}/account/session`;
    const res = await fetch(u);
    const resp = await res.json();

    if(resp?.valid && resp?.credentials?.admin) {
      data = resp.credentials
    }
  }

  return data;
}

