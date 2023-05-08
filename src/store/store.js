import { writable } from 'svelte/store';

function createApp() {

  let app = {
    active: false,
    ready: false,
    sessions: [],
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


  const { subscribe, set, update } = writable(app);

  return {
    subscribe,
    writable,
    set,
    saveCredentials,
    removeCredentials,
  };
}

export const store = createApp();

