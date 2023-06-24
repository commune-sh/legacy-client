import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { generateInitials } from '$lib/utils/utils.js'
import { writable } from 'svelte/store';

function createApp() {

  let app = {
    down: false,
    healthy: true,
    active: false,
    ready: false,
    features: null,
    authenticated: false,
    authenticating: {
      active: false,
      mode: null,
    },
    showVerificationAlert: false,
    startAccountVerification: false,
    refreshingFeed: false,
    verifiedSession: false,
    credentials: null,
    rooms: [],
    spaces: [],
    spacesFetched: false,
    states: [],
    spacePaths: [],
    stateReady: false,
    pageState: [],
    events: [],
    events_cache: [],
    replies: [],
    menuToggled: false,
    editorStates: [],
    settings: {
      active: false,
    },
    federated: {
      active: false,
      endpoint: null,
    },
    staticRoutes: [
      {
        path: '/discover',
        name: 'Discover Spaces',
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
    emojiPicker: {
      active: false,
    },
    modal: {
      active: false,
      content: null,
    },
    addingRoom: false,
    spaceSettingsOpen: false,
  }

  if(window) {
    window.app = app
  }

  let theme = localStorage.getItem(`theme`) || "{}"
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

  let startAuthenticating = (mode) => {
    update(p => {
      p.authenticating.active = true
      p.authenticating.mode = mode
      return p
    })
  }

  let stopAuthenticating = () => {
    update(p => {
      p.authenticating.active = false
      p.authenticating.mode = null
      return p
    })
  }

  let stateReady = () => {
    update(p => {
      p.stateReady = true
      return p
    })
  }

  let stateNotReady = () => {
    update(p => {
      p.stateReady = false
      return p
    })
  }

  let isFederated= (x) => {
    update(p => {
      p.federated = {
        active: true,
        endpoint: x.endpoint,
      }
      return p
    })
  }
  let isNotFederated = () => {
    update(p => {
      p.federated = {
        active: false,
        endpoint: null,
      }
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

  let accountVerified = (email) => {
    update(p => {
      p.credentials.email = email
      p.credentials.verified = true
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

  let addEventReplies = (post, replies) => {
    update(p => {
      p.replies[post] = replies
      return p
    })
  }

  let addToRoomEvents = (room_id, events) => {
    update(p => {
      p.events[room_id]?.push(...events)
      return p
    })
  }

  let updateRoomEvents = (room_id, events) => {
    update(p => {
      for (const event of events) {
        const exists = p.events[room_id].some(
          (item) => item.event_id === event.event_id
        );

        if (!exists) {
          let index = 0;
          while (
            index < p.events[room_id].length &&
            p.events[room_id][index].origin_server_ts > event.origin_server_ts
          ) {
            index++;
          }
          p.events[room_id].splice(index, 0, event);
        }
      }

      return p
    })
  }

  let addNewPostToRoom = (room_id, events) => {
    update(p => {
      p.events[room_id]?.unshift(events)
      return p
    })
  }

  let addReaction = (event, key, sender, isReply, post) => {
    update(p => {
      let item = p.events[event.room_id].find(x => x.event_id == event.event_id)
      if(isReply && post) {
        item = p.replies[post].find(x => x.event_id == event.event_id)
      }
      if(item && item?.reactions) {
        let i = item?.reactions?.findIndex(r => r.key === key);
        if (i !== -1) {
          item?.reactions[i].senders.push(sender);
        } else {
          let newReaction = {
            key: key,
            senders: [sender]
          };

          item.reactions.push(newReaction);
        }
      } else {
        item.reactions = [
          {
            key: key,
            senders: [sender]
          }
        ]
        
      } 

      return p
    })
  }

  let removeReaction = (event, key, sender, isReply, post) => {
    update(p => {
      let item = p.events[event.room_id].find(x => x.event_id == event.event_id)
      if(isReply && post) {
        item = p.replies[post].find(x => x.event_id == event.event_id)
      }
      if(item) {
        let i = item.reactions?.findIndex(r => r.key === key);
        if (i !== -1) {
          let senders = item.reactions[i].senders;
          let senderIndex = senders.indexOf(sender);

          if (senderIndex !== -1) {
            senders.splice(senderIndex, 1);

            if (senders.length === 0) {
              item.reactions.splice(i, 1);
            }
          }
        }
      }

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
      generateInitials(p.spaces);
      return p
    })
  }
  let addSpace = (x) => {
    update(p => {
      p.spaces.push(x)
      p.spaces.sort((a, b) => a.alias.toLowerCase().localeCompare(b.alias.toLowerCase()));
      generateInitials(p.spaces);
      return p
    })
  }


  let addSpaceState = (space, state) => {
    update(p => {
      p.states[space] = state
      return p
    })
  }

  let addRoomToSpaceState = (space, state) => {
    update(p => {
      if(!p.states[space]?.children) {
        p.states[space].children = []
      }
      p.states[space].children.push(state)
      return p
    })
  }

  let updateRoomTopics = (space, room, topics) => {
    update(p => {
      if(room == 'general') {
        p.states[space].space.topics = topics

      } else {
        let r = p.states[space].children.find(x => x.alias == room)
        if(r) {
          r.topics = topics
        }
      }
      return p
    })
  }

  let updateSpaceAvatar = (space, avatar) => {
    update(p => {
      let s = p.spaces.find(x => x.alias == space)
      if(s) {
        s.avatar = avatar
      }
      p.states[space].space['avatar'] = avatar
      return p
    })
  }

  let updateSpaceHeader = (space, header) => {
    update(p => {
      let s = p.spaces.find(x => x.alias == space)
      if(s) {
        s.header = header
      }
      p.states[space].space['header'] = header
      return p
    })
  }

  let updateSpaceType = (space, type) => {
    update(p => {
      p.states[space].space['type'] = type
      return p
    })
  }

  let updateSpaceRestrictions = (space, restrictions) => {
    update(p => {
      p.states[space].space['restrictions'] = restrictions
      return p
    })
  }

  let updateSpaceDefault = (space, d) => {
    update(p => {
      p.states[space].is_default = d
      return p
    })
  }


  let updateSpaceInfo = (space, info) => {
    update(p => {
      let s = p.spaces.find(x => x.alias == space)
      if(s) {
        s.name = info.name 
        s.topic = info.topic
      }
      p.states[space].space['name'] = info.name
      p.states[space].space['topic'] = info.topic
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

  let addLink = (x) => {
    update(p => {
      if(p.editorStates[x.room_id]?.links == undefined) {
        p.editorStates[x.room_id].links = []
      }
      let index = p.editorStates[x.room_id]?.links.findIndex(l => l.href == x.link.href)
      if(index == -1) {
        p.editorStates[x.room_id]?.links.push(x.link)
      }
      return p
    })
  }

  let deleteLink = (room_id, index) => {
    update(p => {
      p.editorStates[room_id]?.links.splice(index, 1)
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

  let toggleEmojiPicker = () => {
    update(p => {
      p.emojiPicker.active = !p.emojiPicker.active
      return p
    })
  }

  let activateEmojiPicker = (v) => {
    update(p => {
      p.emojiPicker.reacting_to = v.reacting_to
      p.emojiPicker.target = v.target
      p.emojiPicker.position = v.position
      p.emojiPicker.is_reply = v.is_reply
      p.emojiPicker.active = true
      return p
    })
  }

  let killEmojiPicker = () => {
    update(p => {
      p.emojiPicker = {
        active: false,
      }
      return p
    })
  }

  let updateEventsCache = (events) => {
    update(p => {
      events.forEach(item => {
        const exists = p.events_cache.some(event => event.id === item.id);
        if (!exists) {
          p.events_cache.push(item);
        }
      });
      return p
    })
  }

  let showModal = (component, props) => {
    update(p => {
      p.modal = {
        active: true,
        component: component,
        props: props
      }
      return p
    })
  }

  let spacesFetched = () => {
    update(p => {
      p.spacesFetched = true
      return p
    })
  }

  let updateRoomJoinStatus = (space, room_id) => {
    update(p => {
      if(p.states[space]?.room_id == room_id) {
        p.states[space].joined = true
      } else {
        let ind = p.states[space].children.findIndex(r => r.room_id == room_id)
        if(ind != -1) {
          p.states[space].children[ind].joined = true
        }
      }
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
    addToRoomEvents,
    updateRoomEvents,
    addNewPostToRoom,
    addPageState,
    addSpaceState,
    addRoomToSpaceState,
    addSpacePath,
    addSpaceRoomPath,
    toggleMenu,
    toggleSettings,
    addEditorState,
    updateEditorState,
    getEditorState,
    deleteEditorState,
    addAttachment,
    deleteAttachment,
    addLink,
    deleteLink,
    toggleTheme,
    toggleCreateSpace,
    toggleEmojiPicker,
    activateEmojiPicker,
    killEmojiPicker,
    addReaction,
    removeReaction,
    addEventReplies,
    updateEventsCache,
    showModal,
    stateReady,
    stateNotReady,
    isFederated, 
    isNotFederated,
    spacesFetched,
    updateRoomTopics,
    updateSpaceAvatar,
    updateSpaceHeader,
    updateSpaceInfo,
    updateSpaceType,
    updateSpaceRestrictions,
    updateSpaceDefault,
    accountVerified,
    updateRoomJoinStatus,
  };
}

export const store = createApp();

