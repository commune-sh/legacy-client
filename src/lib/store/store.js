import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';
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
    editorStates: [],
    settings: {
      active: false,
    },
    staticRoutes: [
      {
        path: '/discover',
        name: 'Discover',
        route: 'discover',
        component: 'discover.svelte',
      },
      {
        path: '/settings',
        name: 'Settings',
        route: 'settings',
        component: 'settings.svelte',
      },
    ],
    creatingSpace: false,
  }

  let theme = localStorage.getItem(`theme`)
  if(theme == 'light') {
    app.settings.theme = 'light'
  } else if(theme == 'dark') {
    app.settings.theme = 'dark'
  } else {
    app.settings.theme = 'black'
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
      let accounts = localStorage.getItem('accounts')
      if(accounts) {
        accounts = JSON.parse(accounts)
        let exists = accounts.find(x => x.username == p.credentials.username)
        if(exists) {
          //splice it out
          accounts.splice(exists, 1)
          if(accounts.length > 0) {
            localStorage.setItem('accounts', JSON.stringify(accounts))
          } else {
            localStorage.removeItem('accounts')
          }
        }
      }
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

  let toggleSettings = () => {
    update(p => {
      p.settings.active = !p.settings.active
      return p
    })
  }

  let addEditorState = (x) => {
    update(p => {
      p.editorStates[x.room_id] = x.state
      return p
    })
  }
  let updateEditorState = (x) => {
    update(p => {
      p.editorStates[x.room_id].title = x.state.title
      p.editorStates[x.room_id].body = x.state.body
      p.editorStates[x.room_id].focus = x.state.focus
      p.editorStates[x.room_id].cursor = x.state.cursor
      p.editorStates[x.room_id].scroll = x.state.scroll
      return p
    })
  }


  let addAttachment = (x) => {
    update(p => {
      if(p.editorStates[x.room_id]?.attachments == undefined) {
        p.editorStates[x.room_id].attachments = []
      }
      p.editorStates[x.room_id]?.attachments.push(x.attachment)
      return p
    })
  }

  let deleteAttachment = (room_id, index) => {
    update(p => {
      p.editorStates[room_id]?.attachments.splice(index, 1)
      return p
    })
  }


  let getEditorState = (room_id) => {
      return app.editorStates[room_id]
  }


  let deleteEditorState = (room_id) => {
    update(p => {
      delete p.editorStates[room_id]
      return p
    })
  }

  let toggleTheme = () => {
    update(p => {
      if(p.settings.theme == 'light') {
        p.settings.theme = 'dark'
        localStorage.setItem('theme', 'dark')
        document.documentElement.setAttribute('class', 'dark')
      } else if(p.settings.theme == 'dark'){
        p.settings.theme = 'black'
        localStorage.setItem('theme', 'black')
        document.documentElement.setAttribute('class', 'black')
      } else {
        p.settings.theme = 'light'
        localStorage.setItem('theme', 'light')
        document.documentElement.setAttribute('class', 'light')
      }
      return p
    })
  }

  let toggleCreateSpace = () => {
    update(p => {
      p.creatingSpace = !p.creatingSpace
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
    toggleSettings,
    addEditorState,
    updateEditorState,
    getEditorState,
    deleteEditorState,
    deleteAttachment,
    addAttachment,
    toggleTheme,
    toggleCreateSpace,
  };
}

export const store = createApp();

