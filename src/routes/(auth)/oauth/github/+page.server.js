import { PUBLIC_API_URL } from '$env/static/public';

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
    const response = await fetch(`${PUBLIC_API_URL}/account/oauth/github/validate?code=${code}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to exchange code for access token: ${response.statusText}`);
    }

    const d = await response.json();

    data.data = d;

  } catch (error) {
    console.error('Error exchanging code for access token:', error);
  }


  return data;
}

