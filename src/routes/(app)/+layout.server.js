import { PUBLIC_API_URL } from '$env/static/public';

/** @type {import('./$types').LayoutLoad} */
export async function load( { fetch, params, url, cookies } ) {

  let token = cookies.get('token');

  let data = {}

    const post = params.post
    const room = params.room
    const context = url?.searchParams?.get('context');
    const event = post || context;

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
