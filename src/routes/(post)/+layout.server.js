import { PUBLIC_API_URL } from '$env/static/public';

/** @type {import('./$types').LayoutLoad} */
export async function load( { fetch, params } ) {

    if(params.post) {

      try {
        const url = `${PUBLIC_API_URL}/event/${params.post}?replies=true`;
        const res = await fetch( url );
        const resp = await res.json();

        if(res.ok && resp?.event) {
          return resp
        }

      } catch (error) {
        console.log(error);
        return {
          status: 500,
          error: error.message
        }
      }


    }
}

