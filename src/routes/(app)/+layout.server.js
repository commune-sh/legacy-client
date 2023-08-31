import { PUBLIC_API_URL } from '$env/static/public';

/** @type {import('./$types').LayoutLoad} */
export async function load( { fetch, params, url, cookies, request } ) {

  let hasToken = false;
  let token = cookies.get('token');
  if(token) {
    hasToken = true;
  }

  let agent = request.headers.get('user-agent')

  const browsers = /(Mozilla|Chrome|Safari|Firefox|Edge)/i;
  const isBrowser = browsers.test(agent);

  let view = url?.searchParams?.get('view');
  const chat_view = view === 'chat';
  const board_view = view === 'board';

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
  const filter = url?.searchParams?.get('filter');
  const event = post || context;

  let isIndex = url?.pathname === '/';
  let isAll = url?.pathname === '/all';

  if((isIndex && !hasToken) || isAll) {
    let url = `${PUBLIC_API_URL}/events`;

    if(filter == 'social' || filter == 'spaces') {
        url = `${url}?filter=${filter}`
    }

    const res = await fetch( url );
    const resp = await res.json();

    data.events = resp.events;
  }

  if(isIndex && hasToken) {
    let url = `${PUBLIC_API_URL}/feed`;
    if(filter == 'social' || filter == 'spaces') {
        url = `${url}?filter=${filter}`
    }

    const res = await fetch( url );
    const resp = await res.json();

    data.events = resp.events;
  }

  if(params?.space) {

    let url = `${PUBLIC_API_URL}/${params.space}/state`;

    const res = await fetch( url );
    const resp = await res.json();

    data.state = resp.state;

    let space_type = resp.state?.space?.type;

    let messages = false;

    if(isBrowser){
      let url = `${PUBLIC_API_URL}/${params.space}/events`;

      /*
      if((space_type == "chat" && !board_view) || chat_view) {
        url = `${PUBLIC_API_URL}/room/${data.state.room_id}/messages`;
        messages = true;
      }
      */

      if(params?.room) {
        url = `${PUBLIC_API_URL}/${params.space}/${params.room}/events`;

        let room = data.state?.children?.find(child => child.alias === params.room );

        let room_type = room?.type;
        /*
        if((room_type == "chat" && !board_view) || chat_view) {
          url = `${PUBLIC_API_URL}/room/${room.room_id}/messages`;
          messages = true;
        }
        */

      }

      if(params.topic) {
        url = url + `?topic=${params.topic}`
      }

      const res = await fetch( url );
      const resp = await res.json();

      if(messages) {
        data.messages = resp.events.reverse();
      } else {
        data.events = resp.events;
      }

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
