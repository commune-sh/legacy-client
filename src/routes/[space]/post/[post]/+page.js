import { error } from '@sveltejs/kit';
import { APIRequest } from '../../../../utils/request.js'
import Config from '../../../../../config.json'


export async function load({ params }) {

  console.log("LOOOOOOL", params)

    const data = await APIRequest({
      url: `${Config.baseURL}/${params.space}/post/${params.post}`,
      method: 'GET',
    })

    if (data) {
        return data;
    }

    throw error(404, 'Not found');
}
