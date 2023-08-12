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
    restrictions: null,
    authenticated: false,
    authenticating: {
      active: false,
      mode: null,
    },
    showVerificationAlert: false,
    startAccountVerification: false,
    verifiedSession: false,
    credentials: null,
    notifications: [],
    rooms: [],
    defaultSpaces: [],
    spaces: [],
    spacesFetched: false,
    states: [],
    space_emoji: [],
    alert: {
      active: false,
      message: null,
    },
    power_levels: [],
    spacePaths: [],
    stateReady: false,
    pageState: [],
    events: [],
    events_cache: [],
    thread_events: [],
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
      {
        path: '/about',
        name: 'About',
        route: 'about',
        component: 'about.svelte',
      },
    ],
    creatingSpace: false,
    emojiPicker: {
      active: false,
    },
    modal: {
      active: false,
      component: null,
    },
    addingRoom: false,
    spaceSettingsOpen: false,
    roomSettings: false,
    userSettings: {
      active: false,
      mode: null,
    },
    gallery: {
      active: false,
    },
    discoverSpacesOpen: false,
    aboutOpen: false,
    accountCreated: false,
    loadEmojiPicker: false,
    reloadFeed: false,
    movingPost: null,
    draggable: null,
    indexSort: null,
    redactedEvent: null,
    roomViews: [],
    showRoomUsers: false,
    roomMembers: [],
  }

  let theme = localStorage.getItem(`theme`) || "{}"
  if(theme == 'light') {
    app.settings.theme = 'light'
  } else if(theme == 'dark') {
    app.settings.theme = 'dark'
  } else {
    app.settings.theme = 'black'
  }

  let showUsers = localStorage.getItem(`show_users`)
  if(showUsers == 'true') {
    app.showRoomUsers = true
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

  let setRestrictions = (v) => {
    update(p => {
      p.restrictions = v
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
        media_url: x.media_url,
      }
      return p
    })
  }
  let isNotFederated = () => {
    update(p => {
      p.federated = {
        active: false,
        endpoint: null,
        media_url: null,
      }
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

  let logout = async () => {
    update(p => {
      /*
      let accounts = localStorage.getItem('accounts')
      if(accounts) {
        accounts = JSON.parse(accounts)
        let exists = accounts.find(x => x.username == p?.credentials?.username)
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
      */
      p.authenticated = false
      p.credentials = null
      p.rooms = []
      p.notifications = []
      p.power_levels = []
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

  let saveDefaultSpaces = (x) => {
    update(p => {
      p.defaultSpaces = x
      if(x == null) {
        p.defaultSpaces = []
      }
      generateInitials(p.defaultSpaces);
      return p
    })
  }

  let savePowerLevels = (x) => {
    update(p => {
      p.power_levels = x
      if(x == null) {
        p.power_levels = []
      }
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

  let removeSpace = (x) => {
    update(p => {
      p.spaces = p.spaces.filter(s => s.alias != x)
      //p.spaces.push(x)
      //p.spaces.sort((a, b) => a.alias.toLowerCase().localeCompare(b.alias.toLowerCase()));
      return p
    })
  }

  let removeRoom = (x) => {
    update(p => {
      console.log(p.rooms.length)
      p.rooms = p.rooms.filter(s => s != x)
      console.log("removed",p.rooms.length)
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
      p.states[space]?.children.sort((a, b) => a.alias.toLowerCase().localeCompare(b.alias.toLowerCase()));
      return p
    })
  }

  let updateRoomTopics = (space, room, topics) => {
    update(p => {
      if(room == 'general') {
        p.states[space].space.topics = topics

      } else {
        let r = p.states[space].children?.find(x => x.alias == room)
        if(r) {
          r.topics = topics
        }
      }
      return p
    })
  }

  let updateSpaceRoomOrder = (space, order) => {
    update(p => {
      if(p.states[space]?.space?.settings) {
        p.states[space].space.settings.room_order = order
      }
      return p
    })
  }

  let addSpaceRoomOrderItem = (space, item) => {
    update(p => {
      if(p.states[space].space.settings.room_order) {
        p.states[space].space.settings.room_order.push(item)
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
      console.log(space)
      if(p.states[space]) {
        p.states[space].space['avatar'] = avatar
      }
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

  let updateSpaceRoomType = (space, room_id, type) => {
    update(p => {
      let ind = p.states[space]?.children?.findIndex(x => x.room_id == room_id)
      if(ind !== -1) {
        p.states[space].children[ind].type = type
      }
      return p
    })
  }
  let updateSpaceRoomAvatar = (space, room_id, avatar) => {
    update(p => {
      let ind = p.states[space]?.children?.findIndex(x => x.room_id == room_id)
      if(ind !== -1) {
        p.states[space].children[ind].avatar = avatar
      }
      return p
    })
  }


  let updateSpaceRoomHeader = (space, room_id, header) => {
    update(p => {
      let ind = p.states[space]?.children?.findIndex(x => x.room_id == room_id)
      if(ind !== -1) {
        p.states[space].children[ind].header = header
      }
      return p
    })
  }


  let updateSpacePinnedEvents = (space, pinned_events) => {
    update(p => {
      p.states[space].space['pinned_events'] = pinned_events
      return p
    })
  }


  let removeSpaceRoom = (space, room_id, type) => {
    update(p => {
      let ind = p.states[space]?.children?.findIndex(x => x.room_id == room_id)
      if(ind !== -1) {
        p.states[space].children.splice(ind, 1)
      }
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
      if(p.states[space]?.space) {
        p.states[space].space['name'] = info.name
        p.states[space].space['topic'] = info.topic
      }
      return p
    })
  }

  let updateSpaceRoomInfo = (space, room_id, info) => {
    update(p => {
      let ind = p.states[space]?.children?.findIndex(x => x.room_id == room_id)
      if(ind !== -1) {
        p.states[space].children[ind].name = info.name 
        p.states[space].children[ind].alias = info.name 
        p.states[space].children[ind].topic = info.topic
      }
      return p
    })
  }

  let updateSpaceDoNotIndex = (space, dni) => {
    update(p => {
      let s = p.spaces.find(x => x.alias == space)
      if(s) {
        s.do_not_index = dni
      }
      p.states[space].space['do_not_index'] = dni
      return p
    })
  }

  let updateSpaceNSFW = (space, nsfw) => {
    update(p => {
      p.states[space].space.settings.nsfw = nsfw
      return p
    })
  }


  let updateSpaceRoomDoNotIndex = (space, room_id, dni) => {
    update(p => {
      let ind = p.states[space]?.children?.findIndex(x => x.room_id == room_id)
      if(ind !== -1) {
        p.states[space].children[ind].do_not_index = dni
      }
      return p
    })
  }

  let updateSpaceRoomNSFW = (space, room_id, nsfw) => {
    update(p => {
      let ind = p.states[space]?.children?.findIndex(x => x.room_id == room_id)
      if(ind !== -1) {
        p.states[space].children[ind].settings.nsfw = nsfw
      }
      return p
    })
  }


  let addSpaceEmoji = (space, emoji) => {
    update(p => {
      if(p.states[space]?.space) {
        if(!p.states[space].space.settings.emoji) {
          p.states[space].space.settings.emoji = []
        }
        p.states[space].space.settings.emoji.push(emoji)
      }
      return p
    })
  }

  let updateSpaceEmoji = (space, emoji) => {
    update(p => {
      if(p.states[space]?.space) {
        if(!p.states[space].space.settings.emoji) {
          p.states[space].space.settings.emoji = []
        }
        p.states[space].space.settings.emoji = emoji
      }
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
      if(!p.editorStates[x.room_id]) {
        p.editorStates[x.room_id] = {}
      }
      if(p.editorStates[x.room_id]) {
        if(!p.editorStates[x.room_id]?.attachments) {
          p.editorStates[x.room_id].attachments = []
        }
        p.editorStates[x.room_id]?.attachments.push(x.attachment)
      }
      return p
    })
  }

  let deleteAttachment = (room_id, index) => {
    update(p => {
      p.editorStates[room_id].attachments.splice(index, 1)
      return p
    })
  }

  let updateAttachmentName = (room_id, index, name) => {
    update(p => {
      p.editorStates[room_id].attachments[index].newname = name
      return p
    })
  }

  let addLink = (x) => {
    update(p => {
      if(!p.editorStates[x.room_id]) {
        p.editorStates[x.room_id] = {}
      }
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
      p.emojiPicker.space_alias = v.space_alias
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
        let ind = p.states[space].children?.findIndex(r => r.room_id == room_id)
        if(ind != -1) {
          p.states[space].children[ind].joined = true
        }
      }
      return p
    })
  }

  let updateRoomLeftStatus = (space, room_id) => {
    update(p => {
      if(p.states[space]?.room_id == room_id) {
        p.states[space].joined = false
      } else {
        let ind = p.states[space].children?.findIndex(r => r.room_id == room_id)
        if(ind != -1) {
          p.states[space].children[ind].joined = false
        }
      }
      return p
    })
  }

  let updateRoomView = (room_id, view) => {
    update(p => {
      p.roomViews[room_id] = view
      return p
    })
  }


  let addNotification = (x) => {
    update(p => {
      p.notifications?.unshift(x)
      return p
    })
  }

  let addThreadEvent = (slug, event) => {
    update(p => {
      let ind = p.thread_events[slug]?.findIndex(e => e.transaction_id == event.transaction_id)
      if(ind == -1) {
        p.thread_events[slug]?.push(event)
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
    setRestrictions,
    saveCredentials,
    removeCredentials,
    saveRooms,
    addRoom,
    saveDefaultSpaces,
    saveSpaces,
    addSpace,
    removeSpace,
    removeRoom,
    startAuthenticating,
    stopAuthenticating,
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
    updateAttachmentName,
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
    updateSpaceRoomInfo,
    updateSpaceRoomAvatar,
    updateSpaceRoomHeader,
    updateSpaceDoNotIndex,
    updateSpaceRoomDoNotIndex,
    updateSpaceType,
    updateSpaceRoomType,
    updateSpaceRestrictions,
    updateSpacePinnedEvents,
    updateSpaceDefault,
    accountVerified,
    updateRoomJoinStatus,
    updateRoomLeftStatus,
    removeSpaceRoom,
    savePowerLevels,
    addNotification,
    addSpaceEmoji,
    updateSpaceEmoji,
    updateRoomView,
    addThreadEvent,
    updateSpaceRoomOrder,
    addSpaceRoomOrderItem,
    updateSpaceNSFW,
    updateSpaceRoomNSFW
  };
}

export const store = createApp();

