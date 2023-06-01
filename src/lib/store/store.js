import { PUBLIC_BASE_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { APIRequest } from '$lib/utils/request.js'
import { writable } from 'svelte/store';

function createApp() {

  let app = {
    down: false,
    healthy: true,
    active: false,
    ready: false,
    features: null,
    authenticated: false,
    authenticating: false,
    refreshingFeed: false,
    verifiedSession: false,
    credentials: null,
    rooms: [],
    spaces: [],
    states: [],
    spacePaths: [],
    pageState: [],
    events: [],
    menuToggled: false,
  }


  let setDownState = (v) => {
    update(p => {
      p.down = v
      return p
    })
  }

  let setHealth = (v) => {
    update(p => {
      p.healthy = v
      return p
    })
  }

  let setFeatures = (v) => {
    update(p => {
      p.features = v
      return p
    })
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

  let startRefreshingFeed = () => {
    update(p => {
      p.refreshingFeed = true
      return p
    })
  }

  let stopRefreshingFeed = () => {
    update(p => {
      p.refreshingFeed = false
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

  let addRoomEvents = (room_id, events) => {
    update(p => {
      p.events[room_id] = events
      return p
    })
  }

  let addPageState = (params) => {
    update(p => {
      return p
    })
  }

  let saveRooms = (x) => {
    update(p => {
      p.rooms = x
      return p
    })
  }

  let addRoom = (x) => {
    update(p => {
      p.rooms.push(x)
      if(x == null) {
        p.rooms = []
      }
      return p
    })
  }

  let saveSpaces = (x) => {
    update(p => {
      p.spaces = x
      if(x == null) {
        p.spaces = []
      }
      return p
    })
  }
  let addSpace = (x) => {
    update(p => {
      p.spaces.push(x)
      return p
    })
  }


  let addSpaceState = (space, state) => {
    update(p => {
      p.states[space] = state
      return p
    })
  }

  let addSpacePath = (space, path) => {
    update(p => {
      let x = p.spacePaths[space]
      if(x == undefined) {
        p.spacePaths[space] = path
      } else {
        p.spacePaths[space].pathname = path?.pathname
        p.spacePaths[space].params = path?.params
      }
      return p
    })
  }

  let addSpaceRoomPath = (space, room, path) => {
    update(p => {
      let x = p.spacePaths[space].rooms[room] = path
      return p
    })
  }

  let toggleMenu = () => {
    update(p => {
      p.menuToggled = !p.menuToggled
      return p
    })
  }


  const { subscribe, set, update } = writable(app);

  return {
    subscribe,
    writable,
    set,
    setDownState,
    setHealth,
    setFeatures,
    saveCredentials,
    removeCredentials,
    saveRooms,
    addRoom,
    saveSpaces,
    addSpace,
    startAuthenticating,
    stopAuthenticating,
    startRefreshingFeed,
    stopRefreshingFeed,
    isAuthenticated,
    isNotAuthenticated,
    verifiedSession,
    logout,
    addRoomEvents,
    addPageState,
    addSpaceState,
    addSpacePath,
    addSpaceRoomPath,
    toggleMenu,
  };
}

export const store = createApp();

