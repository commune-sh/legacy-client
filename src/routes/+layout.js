export const ssr = false

import { error } from '@sveltejs/kit';
import { APIRequest } from '../utils/request.js'
import Config from '../../config.json'

export async function load({ params }) {

    const data = await APIRequest({
      url: `${Config.baseURL}/events`,
      method: 'GET',
    })

    if (data) {
        return data;
  } else {
    return {
      error: 404,
      message: `Not found`
    }
  }
}
