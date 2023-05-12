import { error } from '@sveltejs/kit';
import { APIRequest } from '../../utils/request.js'
import Config from '../../../config.json'

export async function load({ params }) {

    let x = params.space;
  if(params?.room) {
    x = params.room
  }

    const data = await APIRequest({
      url: `${Config.baseURL}/${x}`,
      method: 'GET',
    })

    if (data) {
        return data;
    }

    throw error(404, 'Not found');
}
