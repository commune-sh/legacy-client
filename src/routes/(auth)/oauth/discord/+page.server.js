import { PUBLIC_API_URL, PUBLIC_BASE_URL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutLoad} */
export async function load( { fetch, params, url, cookies, request } ) {

  let code = url?.searchParams?.get('code');
  let data = {}

  /*
  try {
    const response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'http://localhost:5173/oauth/discord',
        scope: 'identify',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to exchange code for access token: ${response.statusText}`);
    }

    const d = await response.json();

    data.data = d;

    if(d.access_token) {
      const res = await fetch('https://discord.com/api/users/@me', {
        headers: {
          authorization: `${d.token_type} ${d.access_token}`,
        },
      });
      const user = await res.json();
      data.user = user;
    }

  } catch (error) {
    console.error('Error exchanging code for access token:', error);
  }
  */
  try {
    const response = await fetch(`${PUBLIC_API_URL}/account/oauth/discord/validate?code=${code}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to exchange code for access token: ${response.statusText}`);
    }

    const d = await response.json();

    data.data = d;

    if(d?.access_token && (d?.created || d?.authenticated)) {
      cookies.set('token', d.access_token, {
        path: '/',
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7 * 365,
      });
    }



  } catch (error) {
    console.error('Error exchanging code for access token:', error);
  }

  throw redirect(307, `${PUBLIC_BASE_URL}`);
  return data;
}

