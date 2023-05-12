import { writable } from 'svelte/store';

function createApp() {

  let app = {
    active: false,
    ready: false,
    authenticated: false,
    authenticating: false,
    verifiedSession: false,
    credentials: null,
  }



  let saveCredentials = (creds) => {
    update(p => {
      p.credentials = creds
      return p
    })
  }

  let removeCredentials = () => {
    update(p => {
      p.credentials = null
      return p
    })
  }

  let startAuthenticating = () => {
    update(p => {
      p.authenticating = true
      return p
    })
  }

  let stopAuthenticating = () => {
    update(p => {
      p.authenticating = false
      return p
    })
  }

  let isAuthenticated = () => {
    update(p => {
      p.authenticated = true
      return p
    })
  }

  let isNotAuthenticated = () => {
    update(p => {
      p.authenticated = false
      return p
    })
  }

  let verifiedSession = (v) => {
    update(p => {
      p.verifiedSession = v
      return p
    })
  }

  let logout = () => {
    update(p => {
      p.authenticated = false
      p.credentials = null
      localStorage.removeItem('access_token')
      return p
    })
  }


  const { subscribe, set, update } = writable(app);

  return {
    subscribe,
    writable,
    set,
    saveCredentials,
    removeCredentials,
    startAuthenticating,
    stopAuthenticating,
    isAuthenticated,
    isNotAuthenticated,
    verifiedSession,
    logout,
  };
}

export const store = createApp();

