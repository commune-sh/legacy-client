import { PUBLIC_API_URL, PUBLIC_MEDIA_URL } from '$env/static/public';

/** @type {import('./$types').LayoutLoad} */
export async function load( { fetch, params } ) {

    if(params.post) {

      try {
        const url = `${PUBLIC_API_URL}/event/${params.post}?replies=true`;
        const res = await fetch( url );
        const resp = await res.json();

        if(res.ok && resp?.event) {

          if(resp?.event?.content?.full_body?.rendered_key) {
            const murl = `${PUBLIC_MEDIA_URL}/${resp.event.content.full_body.rendered_key}`
            const re = await fetch( murl );
            const rep = await re.text();
            resp.event.content.full_body.rendered = rep;
          }
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

