import { PUBLIC_API_URL } from '$env/static/public';

/** @type {import('./$types').LayoutLoad} */
export async function load( { fetch, params, url, cookies, request } ) {

  let agent = request.headers.get('user-agent')

  const browsers = /(Mozilla|Chrome|Safari|Firefox|Edge)/i;
  const isBrowser = browsers.test(agent);

  let data = {}

  if(isBrowser) {
    let url = `${PUBLIC_API_URL}/health_check`;
    const res = await fetch( url );
    const resp = await res.json();
    data.health = resp
  }

  return data;
}

