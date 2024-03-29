# ⚠️ This is far from complete.
This repo is here to show what's to come.
<br>
The extension code is not 100% complete and will be missing features for the time being. If you'd like to use this extension before completion, I would recommend making sure you have everything you need and stay updated on this repo.

# Spicetify Custom API Extension
This extension was built to integrate the Stream Deck into Spotify without needing to use the Spotify Web API.
<br>
Click [here](https://github.com/TomH5634142b7/Spotify-Integration-Stream-Deck-Plugin) for the Spotify integration Stream Deck plugin.

# Installation & Usage
## Installation
Before we get started, you must have Spicetify installed. If you do not have Spicetify, please follow [the official Spicetify guide here](https://spicetify.app/docs/getting-started).

### Spicetify Marketplace (*DOES NOT APPLY YET*)
- **⚠️ We are currently not on the Spicetify Marketplace, this is only here for future reference for when we publish the extension**

Before getting started, ensure that you have the Spicetify marketplace installed by opening Spotify. When Spotify loads you should see a "Marketplace" tab below "Search" indicating that you have it installed. If you do not have this tab, please make sure you installed the marketplace from [the official Spicetify guide](https://spicetify.app/docs/getting-started).

Click on the "Marketplace" tab and make sure the "Extensions" tab is selected.

Afterwards click on the "Search Extensions..." textbox and type in "Custom WebSocket API", highlight over the extension and click on the full white install button.

This will ask you to reload Spotify, click on "Reload Now" and now it'll start automatically trying to connect to WebSocket servers on port 22157.

To see how to use this, check the [Stream Deck Usage](#stream-deck-usage) section if you're using this with the Stream Deck or the [Developer Usage](#developer-usage) section if you're creating your own WebSocket server.
<br>
If there's another program you're installing that depends on this extension, you'll have to refer to their guide as I am not affiliated with any of them.

### Manual Installation (*WIP*)

## Stream Deck Usage
If you're using this extension with the Stream Deck plugin you can download and install the plugin from the [plugin GitHub repo](https://github.com/TomH5634142b7/Spotify-Integration-Stream-Deck-Plugin) or from the ~~Elgato marketplace~~ (Coming soon) and the plugin will handle everything for you.

## Developer Usage
If you're developing your own program to communicate with Spotify, you'll need to create a websocket server listening to port 22157. Everytime there's a player update (song change, player position update, volume update, etc) the extension will send info from Spotify to the websocket server in a stringified JSON format.
For example:
```json
{"player":{"context_uri":"spotify:playlist:6iLF2D9RrXpqClDhzYoOi1","entity_uri":"spotify:playlist:6iLF2D9RrXpqClDhzYoOi1","has_context":true,"is_buffering":false,"is_muted":false,"is_playing":true,"is_shuffling":false,"position":128099,"repeat_state":"queue","speed":1,"volume":100},"track":{"album":{"images":{"standard":"spotify:image:ab67616d00001e02312aa00d3fac2260cbd77288","small":"spotify:image:ab67616d00004851312aa00d3fac2260cbd77288","large":"spotify:image:ab67616d0000b273312aa00d3fac2260cbd77288","xlarge":"spotify:image:ab67616d0000b273312aa00d3fac2260cbd77288"},"name":"Call of the Wild (Deluxe Version)","uri":"spotify:album:6JhuNA7potIMg6r29IVULP"},"artists":[{"name":"Powerwolf","uri":"spotify:artist:5HFkc3t0HYETL4JeEbDB1v"}],"podcast":null,"name":"Alive or Undead","duration":263373,"marked_for_download":true,"uri":"spotify:track:3OdjiboTFoyrNIKRkLswuD","playlist_track_index":233,"is_liked":false,"is_19_plus_only":false,"is_explicit":false,"is_local":false,"has_lyrics":true,"media_type":"audio","provider":"context","type":"track"},"queue":{"next_tracks":[]},"scapi_version":"1.0.0"}
```
Player position & song duration are in milliseconds to allow for more customisable humanised formatting options.

You may need to convert the string back into a JSON object when your websocket server receives the data to make it easier to work with, for example using `const json = JSON.parse(data)` for Node.js servers.

Simple example using the `ws` module with the `WebSocketServer` constructor:
```js
const { WebSocketServer } = require("ws")
const wss = new WebSocketServer({ port: 22157 })

wss.on("connection", socket => {
    console.log("Client connected")

    socket.on("message", data => {
        const json = JSON.parse(data)
        console.log(`Stringified data received, converting back to JSON:`, json)
        console.log(`Player Volume:`, json.player.volume)
    })

    socket.on("close", () => {
        console.log("Client disconnected")
    })
})
```

Podcast data is stored in the "podcast" object. For example, this is what will be returned for podcasts:
```json
{"player":{"context_uri":"spotify:show:2X40qLyoj1wQ2qE5FVpA7x","entity_uri":"spotify:show:2X40qLyoj1wQ2qE5FVpA7x","has_context":true,"is_buffering":false,"is_muted":false,"is_playing":true,"is_shuffling":false,"position":633289,"repeat_state":"off","speed":1,"volume":100},"track":{"album":{"images":{"standard":null,"small":null,"large":null,"xlarge":null}},"podcast":{"images":{"standard":"spotify:image:ab67656300005f1ff4e1783e86523c362b5489d8","small":"spotify:image:ab6765630000f68df4e1783e86523c362b5489d8","large":"spotify:image:ab6765630000ba8af4e1783e86523c362b5489d8","xlarge":"spotify:image:ab6765630000ba8af4e1783e86523c362b5489d8"},"name":"Distractible","uri":"spotify:show:2X40qLyoj1wQ2qE5FVpA7x"},"name":"Mark Is A Visionary [Bonus Episode]","duration":1200421,"marked_for_download":false,"uri":"spotify:episode:2wqWgWgXoVhW2d9bDFqgzA","playlist_track_index":4,"is_liked":false,"is_19_plus_only":false,"is_explicit":true,"has_lyrics":false,"media_type":"mixed","provider":"context","type":"episode"},"queue":{"next_tracks":[]},"scapi_version":"1.0.0"}
```

# FAQ
## Why?
The Web API is good, but it has its pitfalls.

You have to always be online and Stream Deck Spotify plugins can be delayed to avoid Web API rate-limits.

Because of this, I decided to make this extension to go with my own custom Stream Deck plugin.

## Why not use WebNowPlaying?
Using WebNowPlaying was my original goal, but I later realised this may cause compatibility issues with Rainmeter due to the same port (8974) being used for both websocket servers.

Instead of looking for other ways to integrate WebNowPlaying into my Stream Deck plugin, I realised I could make something that gives other developers more freedom.

## Why send so much data over to the websocket server?
Even though my Stream Deck plugin requires very little data, I can see other projects having a wide variety of use-cases that may benefit from the extra data.
<br>
I do get that some of the data is probably highly unnecessary, but you never know who might need it.

## What if I want to create an external websocket server for Spicetify to send info to?
You'll need to clone or fork this repository and then modify the `new WebSocket("ws://localhost:22157")` line to `new WebSocket("ws://your-domain/your-websocket-path")`.

To optimise speed and bandwidth usage, you can then remove data you won't be using in the `SendUpdate()` function. Please be aware that if you decide to add something to this function, you will need a way to tell your users that their version is outdated.

**Note**: I do not know if external websocket servers actually work with this project; I designed this to be used locally & have never tested it externally.
