export async function APIRequest(r) {
  try {
    let headers = { 
      'Content-Type': 'application/json',
    }

    const token = localStorage.getItem('access_token')
    console.log("whst is token?", token)

    if(token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    let options = {
      method: 'POST',
      headers: headers,
    }

    if(r.method) {
      options.method = r.method
    }

    if(r.data) {
      options.body = JSON.stringify(r.data)
    }
    const response = await fetch(r.url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error:', error.message);
    // You can choose to throw or return a specific error object here if needed
  }
}

