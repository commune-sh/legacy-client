import { error } from '@sveltejs/kit';
import { APIRequest } from '../utils/request.js'
import Config from '../../config.json'

export async function load({ params }) {
    const token = localStorage.getItem('access_token')
    console.log('YIKEEEEE Token:', token)

    let opt = {
      url: `${Config.baseURL}/events`,
      method: 'GET',
    }

    if(token) {
        opt.url = `${Config.baseURL}/feed`
        opt.token = token
    }

    const data = await APIRequest(opt)

    if (data) {
        return data;
    }
}
