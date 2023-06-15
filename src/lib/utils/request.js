import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';

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


export async function loadPosts(opt) {
  const data = await APIRequest(opt)
  return data
}

export async function loadPostWithReplies(opt) {
  const data = await APIRequest(opt)
  return data
}

export async function getAPIEndpoint(domain) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/domain/${domain}/api`,
    method: 'GET'
  })
  return data
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

  const response = await fetch(`${PUBLIC_API_URL}/media/presigned_url?filetype=${extension}`,options)
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

  const response = await fetch(`${PUBLIC_API_URL}/event`,options)
  const data = await response.json();
  return data;
}

export async function redactEvent(body) {

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

  const response = await fetch(`${PUBLIC_API_URL}/event/redact`,options)
  const data = await response.json();
  return data;
}


export async function redactReaction(body) {

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

  const response = await fetch(`${PUBLIC_API_URL}/event/redact/reaction`,options)
  const data = await response.json();
  return data;
}


export async function joinSpace(space) {
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
    }

  const response = await fetch(`${PUBLIC_API_URL}/space/${space}/join`, options)
  const data = await response.json();
  return data;
}

export async function joinRoom(room_id) {
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
    }

  const response = await fetch(`${PUBLIC_API_URL}/room/join?id=${room_id}`, options)
  const data = await response.json();
  return data;
}

export async function getLinkMetadata(link) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/link/metadata?href=${link}`,
    method: 'GET'
  })
  return data
}

export async function saveUpvote(event) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/event/upvote?id=${event}`,
    method: 'PUT'
  })
  return data
}

export async function saveDownvote(event) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/event/downvote?id=${event}`,
    method: 'PUT'
  })
  return data
}

