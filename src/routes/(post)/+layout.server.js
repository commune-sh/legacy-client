import { PUBLIC_API_URL, PUBLIC_MEDIA_URL } from '$env/static/public';

/** @type {import('./$types').LayoutLoad} */
export async function load( { fetch, params, request } ) {


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

  if(params.post) {

    try {
      const url = `${PUBLIC_API_URL}/event/${params.post}?replies=true`;
      const res = await fetch( url );
      const resp = await res.json();


      if(res.ok && resp?.event) {
        data.event = resp?.event;
        data.replies = resp?.replies;

        if(resp?.event?.content?.full_body?.rendered_key) {
          const murl = `${PUBLIC_MEDIA_URL}/${resp.event.content.full_body.rendered_key}`
          const re = await fetch( murl );
          const rep = await re.text();
          data.event.content.full_body.rendered = rep;
        }

      }


    } catch (error) {

      data = {
        status: 500,
        error: error.message,
        health: data.health
      }
    }


    return data

  }
}

