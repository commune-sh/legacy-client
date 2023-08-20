//export const prerender = true
import { PUBLIC_API_URL } from '$env/static/public';

/** @type {import('./$types').LayoutLoad} */
export async function load( { fetch, params, url } ) {

    const post = params.post
    const context = url?.searchParams?.get('context');
    const event = post || context;

    if(params?.space) {

      let url = `${PUBLIC_API_URL}/${params.space}/state`;

      const res = await fetch( url );
      const resp = await res.json();


      if(event) {
          let url = `${PUBLIC_API_URL}/event/${event}`;
          const re = await fetch( url );
          const ree = await re.json();


          return {
            state: resp.state,
            event: ree.event
          }

      }


      return resp;

    } else if(event) {
          let url = `${PUBLIC_API_URL}/event/${event}`;
          const res = await fetch( url );
          const resp = await res.json();

          return {
            event: resp.event
          }

    } else {
      return null
    }
}
