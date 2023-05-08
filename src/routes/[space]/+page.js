import { error } from '@sveltejs/kit';
import { APIRequest } from '../../utils/request.js'
import Config from '../../../config.json'

export async function load({ params }) {

    const data = await APIRequest({
      url: `${Config.baseURL}/${params.space}`,
      method: 'GET',
    })

    if (data) {
        return data;
    }

    throw error(404, 'Not found');
}
