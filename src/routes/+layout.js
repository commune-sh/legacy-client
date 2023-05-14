export const ssr = false

import { error } from '@sveltejs/kit';
import { APIRequest } from '../utils/request.js'
import Config from '../../config.json'
import { store } from '../store/store.js'

export async function load({ params }) {
    const token = localStorage.getItem('access_token')

    let url = `${Config.baseURL}/events/`


  let space = params.space
  let isSpace = space && space !== 'undefined' && space?.length > 0
  if(isSpace) {
    url = `${Config.baseURL}/${space}/events`
  }

  let room = params.room
  let isRoom = room && room !== 'undefined' && room?.length > 0
  if(isRoom) {
    url = `${Config.baseURL}/${space}/${room}/events`
  }

    let opt = {
      url: url,
      method: 'GET',
    }

    if(token && !isSpace && !isRoom) {
        opt.url = `${Config.baseURL}/feed`
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
