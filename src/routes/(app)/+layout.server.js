import { PUBLIC_API_URL } from '$env/static/public';

/** @type {import('./$types').LayoutLoad} */
export async function load( { fetch, params, url, cookies, request } ) {

  let authenticated = false;
  let token = cookies.get('token');
  if(token) {
    authenticated = true;
  }

  let agent = request.headers.get('user-agent')

  const browsers = /(Mozilla|Chrome|Safari|Firefox|Edge)/i;

  const isBrowser = browsers.test(agent);

  let data = {browser: isBrowser}

  if(isBrowser) {
    let url = `${PUBLIC_API_URL}/health_check`;
    const res = await fetch( url );
    const resp = await res.json();
    data.health = resp
  }

  const post = params.post
  const room = params.room
  const context = url?.searchParams?.get('context');
  const event = post || context;

  let isIndex = url?.pathname === '/';

  if(isIndex && !authenticated) {
    let url = `${PUBLIC_API_URL}/events`;
    const res = await fetch( url );
    const resp = await res.json();

    data.events = resp.events;
  }

  if(params?.space) {

    let url = `${PUBLIC_API_URL}/${params.space}/state`;

    const res = await fetch( url );
    const resp = await res.json();

    data.state = resp.state;

    {
      let url = `${PUBLIC_API_URL}/${params.space}/events`;
      const res = await fetch( url );
      const resp = await res.json();
      data.events = resp.events;
    }

  } 

  if(event) {
    let url = `${PUBLIC_API_URL}/event/${event}`;
    const res = await fetch( url );
    const resp = await res.json();

    data.event = resp.event;
  }

  return data;
}
