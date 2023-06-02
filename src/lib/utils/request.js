import { PUBLIC_BASE_URL, PUBLIC_APP_NAME } from '$env/static/public';

export async function APIRequest(r) {
  try {
    let headers = { 
      'Content-Type': 'application/json',
    }

    const token = localStorage.getItem('access_token')

    if(token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    if(r.token) {
      headers['Authorization'] = `Bearer ${r.token}`
    }
    let options = {
      method: 'POST',
      headers: headers,
    }

    if(r.method) {
      options.method = r.method
    }

    if(r.body) {
      options.body = JSON.stringify(r.body)
    }

    const response = await fetch(r.url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error:', error.eessage);
  }
}

export async function getPresignedURL(extension) {
    let headers = { 
      'Content-Type': 'application/json',
    }

    const token = localStorage.getItem('access_token')

    if(token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    let options = {
      headers: headers,
    }

  const response = await fetch(`${PUBLIC_BASE_URL}/media/presigned_url?filetype=${extension}`,options)
  const data = await response.json();
  return data;
}


export async function uploadAttachment(file, url) {
    let options = {
      method: "PUT",
      body: file
    }

  const response = await fetch(url, options)
  const data = await response;
  return data;
}

export async function savePost(body) {

    let headers = { 
      'Content-Type': 'application/json',
    }

    const token = localStorage.getItem('access_token')

    if(token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    let options = {
      headers: headers,
      method: "POST",
      body: JSON.stringify(body)
    }

  const response = await fetch(`${PUBLIC_BASE_URL}/event`,options)
  const data = await response.json();
  return data;
}

