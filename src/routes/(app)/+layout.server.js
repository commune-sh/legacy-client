//export const prerender = true

import { PUBLIC_API_URL } from '$env/static/public';

/** @type {import('./$types').LayoutLoad} */
export async function load( { params } ) {

    if(params?.space) {

      let url = `${PUBLIC_API_URL}/${params.space}/state`;

      const res = await fetch( url );
      const resp = await res.json();


      if(params.post) {
          let url = `${PUBLIC_API_URL}/event/${params.post}`;
          const re = await fetch( url );
          const ree = await re.json();


          return {
            state: resp.state,
            event: ree.event
          }

      }


      return resp;

    } else if(params?.post) {
          let url = `${PUBLIC_API_URL}/event/${params.post}`;
          const res = await fetch( url );
          const resp = await res.json();

          return {
            event: resp.event
          }

    } else {
      return null
    }
}
