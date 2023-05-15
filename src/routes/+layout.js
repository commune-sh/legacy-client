export const ssr = false


import { error } from '@sveltejs/kit';
import { APIRequest } from '../utils/request.js'
import { store } from '../store/store.js'
import { PUBLIC_BASE_URL } from '$env/static/public';

export async function load({ params }) {

    const token = localStorage.getItem('access_token')

    let url = `${PUBLIC_BASE_URL}/events/`


  let space = params.space
  let isSpace = space && space !== 'undefined' && space?.length > 0
  if(isSpace) {
    url = `${PUBLIC_BASE_URL}/${space}/events`
  }

  let room = params.room
  let isRoom = room && room !== 'undefined' && room?.length > 0
  if(isRoom) {
    url = `${PUBLIC_BASE_URL}/${space}/${room}/events`
  }

    let opt = {
      url: url,
      method: 'GET',
    }

    if(token && !isSpace && !isRoom) {
        opt.url = `${PUBLIC_BASE_URL}/feed`
        opt.token = token
    }

    const data = await APIRequest(opt)

    if (data) {
        //store.addRoomEvents(data.state.room_id, data.events)
        return data;
  } else {
    return {
      down: true,
    }
  }
}
