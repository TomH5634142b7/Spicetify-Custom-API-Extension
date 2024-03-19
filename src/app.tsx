const SCAPI_VERSION = "1.0.0-development"

class SpotifyWebSocket {
  ws = null;
  updateInterval = null;
  connectionTimeout = null;
  reconnectTimeout = null;
  isClosed = false;

  constructor() {
    this.init()
  }

  init() {
    try {
      this.ws = new WebSocket("ws://localhost:22157")
      this.ws.onopen = this.onOpen.bind(this);
      this.ws.onclose = this.onClose.bind(this);
      this.ws.onerror = this.onError.bind(this);
      this.ws.onmessage = this.onMessage.bind(this);
    } catch {
      this.retry()
    }
  }

  close(cleanup = false) {
    if (!cleanup) this.isClosed = true;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.connectionTimeout) clearTimeout(this.connectionTimeout);
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
    }
  }

  retry() {
    if (this.isClosed) return;
    this.close(true);
    this.reconnectTimeout = setTimeout(() => {
      this.init();
    }, 1000);
  }

  onOpen() {
    let interval

    interval = setInterval(() => {
      if (Spicetify.Platform && Spicetify.Player && Spicetify.React && Spicetify.ReactDOM && Spicetify.Platform.LibraryAPI) { // NOTE: I'm sure a lot of this isn't required, but it works. Waits until Spotify loads properly before initialising the API as it tends to have issues if it's connecting to a server while Spotify is loading.
        clearInterval(interval)
        interval = null

        Spicetify.Player.addEventListener("appchange", this.sendUpdate.bind(this))
        Spicetify.Player.addEventListener("onplaypause", this.sendUpdate.bind(this))
        Spicetify.Player.addEventListener("onprogress", this.sendUpdate.bind(this))
        Spicetify.Player.addEventListener("songchange", this.sendUpdate.bind(this))
        Spicetify.Platform.PlaybackAPI._events._emitter.addListener("volume", this.sendUpdate.bind(this))
        // NOTE: A lot of the events below probably aren't a requirement but I don't have a lot to work with.
        Spicetify.Platform.PlaybackAPI._events._emitter.addListener("action", this.sendUpdate.bind(this))
        Spicetify.Platform.PlaybackAPI._events._emitter.addListener("error", this.sendUpdate.bind(this))
        Spicetify.Platform.PlaybackAPI._events._emitter.addListener("queue_action_complete", this.sendUpdate.bind(this))
        Spicetify.Platform.PlaybackAPI._events._emitter.addListener("queue_update", this.sendUpdate.bind(this))
        Spicetify.Platform.PlaybackAPI._events._emitter.addListener("update", this.sendUpdate.bind(this))

        this.sendUpdate()
      }
    }, 500)
  }

  onClose() {
    this.retry();
  }

  onError() {
    this.retry();
  }

  onMessage(event) {
    OnMessage(this, event.data)
  }

  sendUpdate() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    SendUpdate(this);
  }
}

function SendUpdate(self) {
  const repeatState = Spicetify.Player.getRepeat()
  let repeat_state;

  switch (repeatState) {
    case 0:
      repeat_state = "off"
      break
    case 1:
      repeat_state = "queue"
      break
    case 2:
      repeat_state = "track"
      break
    default:
      repeat_state = "unknown"
      break
  }

  const nextTracks = []

  for (const track of Spicetify.Player.data.nextItems.slice(0, 10)) {
    nextTracks.push(getQueueTrackJSON(track))
  }

  const json = {
    player: {
      context_uri: Spicetify.Player.data.item.metadata.context_uri,
      entity_uri: Spicetify.Player.data.item.metadata.entity_uri,
      has_context: Spicetify.Player.data.hasContext,
      is_buffering: Spicetify.Player.data.isBuffering,
      is_muted: Spicetify.Player.getMute(),
      is_playing: Spicetify.Player.isPlaying(),
      is_shuffling: Spicetify.Player.getShuffle(),
      position: Spicetify.Player.getProgress(),
      repeat_state: repeat_state,
      speed: Spicetify.Player.data.speed,
      volume: (Spicetify.Player.getVolume() * 100).toFixed(2),
    },
    track: {
      album: {
        images: {
          standard: Spicetify.Player.data.item?.album?.images.find(d => d.label === "standard")?.url || null,
          small: Spicetify.Player.data.item?.album?.images.find(d => d.label === "small")?.url || null,
          large: Spicetify.Player.data.item?.album?.images.find(d => d.label === "large")?.url || null,
          xlarge: Spicetify.Player.data.item?.album?.images?.find(d => d.label === "xlarge")?.url || null
        },
        name: Spicetify.Player.data.item.album?.name,
        uri: Spicetify.Player.data.item.album?.uri
      },
      artists: Spicetify.Player.data.item?.artists?.map(d => {
        return {
          name: d.name,
          uri: d.uri
        }
      }),
      podcast: Spicetify.Player.data.item["show"] ? {
        images: {
          standard: Spicetify.Player.data.item["show"]?.images?.find(d => d.label === "standard")?.url || null,
          small: Spicetify.Player.data.item["show"]?.images?.find(d => d.label === "small")?.url || null,
          large: Spicetify.Player.data.item["show"]?.images?.find(d => d.label === "large")?.url || null,
          xlarge: Spicetify.Player.data.item["show"]?.images?.find(d => d.label === "xlarge")?.url || null
        },
        name: Spicetify.Player.data.item["show"].name,
        uri: Spicetify.Player.data.item["show"].uri,
      } : null,
      name: Spicetify.Player.data.item?.name,
      duration: Spicetify.Player.getDuration(),
      marked_for_download: Spicetify.Player.data.item.metadata?.marked_for_download === "true",
      uid: Spicetify.Player.data.item.uid,
      uri: Spicetify.Player.data.item.uri,
      playlist_track_index: Spicetify.Player.data.index?.itemIndex + 1,
      is_liked: Spicetify.Player.getHeart(),
      is_19_plus_only: Spicetify.Player.data.item.is19PlusOnly, // INFO: Seems like a Korean Spotify thing https://support.spotify.com/kr-en/article/explicit-content/
      is_explicit: Spicetify.Player.data.item.isExplicit,
      is_local: Spicetify.Player.data.item.isLocal,
      has_lyrics: Spicetify.Player.data.item.metadata?.has_lyrics === "true",
      media_type: Spicetify.Player.data.item.mediaType,
      provider: Spicetify.Player.data.item.provider,
      type: Spicetify.Player.data.item.type
    },
    queue: {
      next_tracks: nextTracks,
    },
    spotify_version: Spicetify.Platform.PlatformData.client_version_quintuple,
    spicetify_version: Spicetify.Config.version,
    scapi_version: SCAPI_VERSION,
  }

  self.ws.send(JSON.stringify(json))

  function getQueueTrackJSON(track: Spicetify.PlayerTrack) {
    return {
      album: {
        name: track.album?.name,
        uri: track.album?.uri,
        images: {
          standard: track.album?.images.find(d => d.label === "standard")?.url || null,
          small: track.album?.images.find(d => d.label === "small")?.url || null,
          large: track.album?.images.find(d => d.label === "large")?.url || null,
          xlarge: track.album?.images?.find(d => d.label === "xlarge")?.url || null,
        },
      },
      artists: track.artists?.map(d => {
        return {
          name: d.name,
          uri: d.uri
        }
      }),
      podcast: track["show"] ? {
        images: {
          standard: track["show"]?.images?.find(d => d.label === "standard")?.url || null,
          small: track["show"]?.images?.find(d => d.label === "small")?.url || null,
          large: track["show"]?.images?.find(d => d.label === "large")?.url || null,
          xlarge: track["show"]?.images?.find(d => d.label === "xlarge")?.url || null,
        },
        name: track["show"].name,
        uri: track["show"].uri,
      } : null,
      name: track.name,
      duration: track.duration.milliseconds,
      marked_for_download: track.metadata?.marked_for_download === "true",
      uid: track.uid,
      uri: track.uri,
      is_19_plus_only: track.is19PlusOnly,
      is_explicit: track.isExplicit,
      is_local: track.isLocal,
      media_type: track.mediaType,
      provider: track.provider,
      type: track.type
    }
  }
}

function OnMessage(self, message) {
  try {
    const [type, data] = message.split(" ")

    switch (type) {
      case "TOGGLE_PLAYING":
        Spicetify.Player.togglePlay()
        break
      case "RESUME":
        Spicetify.Player.play()
        break
      case "PAUSE":
        Spicetify.Player.pause()
      case "PLAY_URI": {
        const uri = Spicetify.URI.from(data)

        if (uri) {
          Spicetify.Player.playUri(uri.toURI())
        } else {
          // TODO: Send invalid URI error
        }
        break
      } case "ADD_TO_QUEUE": { // TODO: Add support for multiple URIs in one message
        const uri = Spicetify.URI.from(data)

        if (uri) {
          Spicetify.Platform.PlayerAPI.addToQueue([{ uri: uri.toURI() }])
        }
        else {
          // TODO: Send invalid URI error
        }
        break
      } case "CLEAR_QUEUE":
        Spicetify.Platform.PlayerAPI.clearQueue()
        break
      case "REMOVE_FROM_QUEUE": { // TODO: Add support for multiple URIs in one message
        const uri = Spicetify.URI.from(data)

        if (uri) {
          Spicetify.removeFromQueue([{ uri: uri.toURI() }])
        }
        else {
          // TODO: Send invalid URI error
        }
        break
      } case "NEXT":
        Spicetify.Player.next()
        break
      case "PREVIOUS":
        Spicetify.Player.back()
        break
      case "TOGGLE_SHUFFLE":
        Spicetify.Player.toggleShuffle()
        break
      case "ENABLE_SHUFFLE":
        Spicetify.Player.setShuffle(true)
        break
      case "DISABLE_SHUFFLE":
        Spicetify.Player.setShuffle(false)
        break
      case "TOGGLE_REPEAT":
        Spicetify.Player.toggleRepeat()
        break
      case "REPEAT_QUEUE":
        Spicetify.Player.setRepeat(1)
        break
      case "REPEAT_TRACK":
        Spicetify.Player.setRepeat(2)
        break
      case "REPEAT_OFF":
        Spicetify.Player.setRepeat(0)
        break
      case "TOGGLE_LIKED":
        Spicetify.Player.toggleHeart()
        break
      case "TOGGLE_MUTE":
        Spicetify.Player.toggleMute()
        break
      case "MUTE":
        Spicetify.Player.setMute(true)
        break
      case "UNMUTE":
        Spicetify.Player.setMute(false)
        break
      case "SET_VOLUME":
        Spicetify.Player.setVolume(data / 100)
        break
      case "DECREASE_VOLUME":
        Spicetify.Player.decreaseVolume()
        break
      case "INCREASE_VOLUME":
        Spicetify.Player.increaseVolume()
        break
    }
  } catch (error) {
    // TODO: Handle error
  }
}

export default new SpotifyWebSocket()