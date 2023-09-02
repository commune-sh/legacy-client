import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { browser } from '$app/environment';

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

    if(browser) {
      const cookies = document.cookie
      const t = cookies.split('token=')[1]?.split(';')[0]
      if(t) {
        headers['Authorization'] = `Bearer ${t}`
      }
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

export function UploadWithProgress(url, file, onProgress, onComplete) {
  const xhr = new XMLHttpRequest();
  xhr.open('PUT', url, true);

  xhr.upload.onprogress = function(event) {
    if (event.lengthComputable) {
      const percentComplete = (event.loaded / event.total) * 100;
      onProgress(percentComplete);
    }
  };

  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status >= 200 && xhr.status < 300) {
        onComplete(null, xhr.responseText);
      } else {
        onComplete(new Error(`Upload failed with status ${xhr.status}`));
      }
    }
  };
  xhr.send(file);
}

export async function uploadImage(file, url) {
    let options = {
      method: "POST",
      body: file,
    }

  const response = await fetch(url, options)
  const data = await response.json();
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

export async function leaveSpace(space) {
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

  const response = await fetch(`${PUBLIC_API_URL}/space/${space}/leave`, options)
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

export async function leaveRoom(room_id) {
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

  const response = await fetch(`${PUBLIC_API_URL}/room/leave?id=${room_id}`, options)
  const data = await response.json();
  return data;
}


export async function getLinkMetadata(link) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/link/metadata?href=${encodeURIComponent(link)}`,
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

export async function loadEvent(event) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/event/${event}`,
  })
  return data
}

export async function searchEvents({query, room_id}) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/search/${room_id}/events?q=${query}`,
    method: 'GET'
  })
  return data
}

export async function createSpace(body) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/space/create`,
    body: body,
  })
  return data
}

export async function createSpaceRoom(body) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/space/room/create`,
    body: body,
  })
  return data
}

export async function createStateEvent(body) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/event/state`,
    body: body,
  })
  return data
}

export async function verifyEmail(body) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/account/verify/email`,
    body: body,
  })
  return data
}

export async function sendCode(body) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/account/verify/code`,
    body: body,
  })
  return data
}

export async function verifyCode(body) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/account/verify`,
    body: body,
  })
  return data
}

export async function passwordRecovery(body) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/account/password`,
    body: body,
  })
  return data
}

export async function verifyRecoverycode(body) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/account/password/verify`,
    body: body,
  })
  return data
}

export async function resetPassword(body) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/account/password/reset`,
    body: body,
  })
  return data
}

export async function updatePassword(body) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/account/password/update`,
    body: body,
  })
  return data
}

export async function updateAvatar(body) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/account/avatar`,
    body: body,
  })
  return data
}

export async function updateDisplayName(body) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/account/display_name`,
    body: body,
  })
  return data
}

export async function discoverSpaces() {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/discover`,
    method: 'GET'
  })
  return data
}

export async function getNotifications() {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/account/notifications`,
    method: 'GET'
  })
  return data
}

export async function readNotifications(last) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/account/notifications/read?last=${last}`,
    method: 'PUT'
  })
  return data
}

export async function getSpaceEmoji() {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/space/emoji`,
    method: 'GET'
  })
  return data
}

export async function suspendUser(user) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/admin/user/suspend?id=${user}`,
    method: 'PUT'
  })
  return data
}

export async function pinToIndex(slug) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/admin/event/pin?slug=${slug}`,
    method: 'PUT'
  })
  return data
}

export async function unpinFromIndex(slug) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/admin/event/unpin?slug=${slug}`,
    method: 'PUT'
  })
  return data
}

export async function validateEmail(email) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/account/email/${email}`,
    method: 'GET'
  })
  return data
}

export async function logout() {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/account/logout`,
    method: 'GET'
  })
  return data
}
export async function getUploadURL() {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/media/upload_url`,
    method: 'GET'
  })
  return data
}

export async function getEventThread(event_id) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/event/${event_id}/thread`,
    method: 'GET'
  })
  return data
}

export async function getRoomMembers(room_id) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/room/${room_id}/members`,
    method: 'GET'
  })
  return data
}

export async function getProfile(username) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/profile/${username}`,
    method: 'GET'
  })
  return data
}

export async function getGIFs() {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/gifs`,
    method: 'GET'
  })
  return data
}

export async function searchGIFs(query) {
  const data = await APIRequest({
    url: `${PUBLIC_API_URL}/gifs/search?q=${query}&limit=50`,
    method: 'GET'
  })
  return data
}
