# ⚠️ This is far from complete.
This repo is here to show what's to come.

I've gotten the base part of the websocket handling ready and will be publishing it here soon.

# Spicetify Custom API Extension
This extension was built to integrate the Stream Deck into Spotify without needing to use the Spotify Web API.

Click [here](https://github.com/TomH5634142b7/Spotify-Integration-Stream-Deck-Plugin) for the Spotify integration Stream Deck plugin.

# Installation & Usage
## Installation

## Stream Deck Usage
If you're using this extension with the Stream Deck plugin you can download and install the plugin from the [plugin GitHub repo](https://github.com/TomH5634142b7/Spotify-Integration-Stream-Deck-Plugin) or from the ~~Elgato marketplace~~ (Coming soon) and the plugin will handle everything for you.

## Developer Usage
If you're developing your own program to communicate with Spotify, you'll need to create a websocket server listening to port 22157. Every 100ms the extension will send Spotify info to the websocket server in a stringified JSON format.
For example:
```json
{"player":{"position":107725,"volume":100,"repeat_state":"queue","speed":1,"is_muted":false,"is_shuffling":false,"is_playing":true,"is_buffering":false},"track":{"name":"Killers with the Cross","duration":250000,"album":{"name":"The Sacrament of Sin","images":{"standard":{"url":"https://o.scdn.co/image/ab67616d00001e02822cf865426a24c2237f4747","uri":"spotify:image:ab67616d00001e02822cf865426a24c2237f4747"},"small":{"url":"https://o.scdn.co/image/ab67616d00004851822cf865426a24c2237f4747","uri":"spotify:image:ab67616d00004851822cf865426a24c2237f4747"},"large":{"url":"https://o.scdn.co/image/ab67616d0000b273822cf865426a24c2237f4747","uri":"spotify:image:ab67616d0000b273822cf865426a24c2237f4747"},"xlarge":{"url":"https://o.scdn.co/image/ab67616d0000b273822cf865426a24c2237f4747","uri":"spotify:image:ab67616d0000b273822cf865426a24c2237f4747"}},"track_count":11,"url":"https://open.spotify.com/album/2t3dociTSaDTmqIlN21rmC","uri":"spotify:album:2t3dociTSaDTmqIlN21rmC"},"marked_for_download":true,"popularity":52,"album_track_index":3,"artists":[{"name":"Powerwolf","url":"https://open.spotify.com/artist/5HFkc3t0HYETL4JeEbDB1v","uri":"spotify:artist:5HFkc3t0HYETL4JeEbDB1v"}],"url":"https://open.spotify.com/track/6OrMblzPzh6Z0pIKVeWwd3","uri":"spotify:track:6OrMblzPzh6Z0pIKVeWwd3","playlist_track_index":231,"is_liked":false,"is_19_plus_only":false,"is_explicit":false,"is_local":false,"has_lyrics":true,"images":{"standard":{"url":"https://o.scdn.co/image/ab67616d00001e02822cf865426a24c2237f4747","uri":"spotify:image:ab67616d00001e02822cf865426a24c2237f4747"},"small":{"url":"https://o.scdn.co/image/ab67616d00004851822cf865426a24c2237f4747","uri":"spotify:image:ab67616d00004851822cf865426a24c2237f4747"},"large":{"url":"https://o.scdn.co/image/ab67616d0000b273822cf865426a24c2237f4747","uri":"spotify:image:ab67616d0000b273822cf865426a24c2237f4747"},"xlarge":{"url":"https://o.scdn.co/image/ab67616d0000b273822cf865426a24c2237f4747","uri":"spotify:image:ab67616d0000b273822cf865426a24c2237f4747"}},"show":{},"media_type":"audio","provider":"context","type":"track"},"scapi_version":"1.0.0"}
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

Podcast data is stored in the "show" object. For example, this is what will be returned for podcasts:
```json
{"player":{"position":601384,"volume":100,"repeat_state":"off","speed":1,"is_muted":false,"is_shuffling":false,"is_playing":true,"is_buffering":false},"track":{"name":"Mark Is A Visionary [Bonus Episode]","duration":1200000,"album":{"images":{"standard":null,"small":null,"large":null,"xlarge":null},"track_count":null,"url":"https://open.spotify.com/album/2X40qLyoj1wQ2qE5FVpA7x","uri":"spotify:show:2X40qLyoj1wQ2qE5FVpA7x"},"marked_for_download":false,"popularity":0,"album_track_index":0,"url":"https://open.spotify.com/track/2wqWgWgXoVhW2d9bDFqgzA","uri":"spotify:episode:2wqWgWgXoVhW2d9bDFqgzA","playlist_track_index":1,"is_liked":false,"is_19_plus_only":false,"is_explicit":true,"has_lyrics":false,"images":{"standard":{"url":"https://o.scdn.co/image/ab67656300005f1ff4e1783e86523c362b5489d8","uri":"spotify:image:ab67656300005f1ff4e1783e86523c362b5489d8"},"small":{"url":"https://o.scdn.co/image/ab6765630000f68df4e1783e86523c362b5489d8","uri":"spotify:image:ab6765630000f68df4e1783e86523c362b5489d8"},"large":{"url":"https://o.scdn.co/image/ab6765630000ba8af4e1783e86523c362b5489d8","uri":"spotify:image:ab6765630000ba8af4e1783e86523c362b5489d8"},"xlarge":{"url":"https://o.scdn.co/image/ab6765630000ba8af4e1783e86523c362b5489d8","uri":"spotify:image:ab6765630000ba8af4e1783e86523c362b5489d8"}},"show":{"name":"Distractible","url":"https://open.spotify.com/show/2X40qLyoj1wQ2qE5FVpA7x","uri":"spotify:show:2X40qLyoj1wQ2qE5FVpA7x","images":{"standard":{"url":"https://o.scdn.co/image/ab67656300005f1ff4e1783e86523c362b5489d8","uri":"spotify:image:ab67656300005f1ff4e1783e86523c362b5489d8"},"small":{"url":"https://o.scdn.co/image/ab6765630000f68df4e1783e86523c362b5489d8","uri":"spotify:image:ab6765630000f68df4e1783e86523c362b5489d8"},"large":{"url":"https://o.scdn.co/image/ab6765630000ba8af4e1783e86523c362b5489d8","uri":"spotify:image:ab6765630000ba8af4e1783e86523c362b5489d8"},"xlarge":{"url":"https://o.scdn.co/image/ab6765630000ba8af4e1783e86523c362b5489d8","uri":"spotify:image:ab6765630000ba8af4e1783e86523c362b5489d8"}}},"media_type":"mixed","provider":"context","type":"episode"},"scapi_version":"1.0.0"}
```

# FAQ
## Why?
The Web API is good, but it has its pitfalls.

You have to always be online and BarRaider's Spotify plugin for the Stream Deck is pretty delayed to avoid Web API rate-limits.

I've also personally had issues with BarRaider's plugin staying connected when you leave Spotify inactive but still open for a bit.

Because of this, I decided to make this extension to go with my own custom Stream Deck plugin.

## Why not use WebNowPlaying?
Using WebNowPlaying was my original goal, but I later realised this may cause compatibility issues with Rainmeter due to the same port (8974) being used for both websocket servers.

Instead of looking for other ways to use WebNowPlaying, I realised I could make something that works for more than just me. A more developer-friendly Spotify websocket API.

## Why send so much data over to the websocket server?
Even though my Stream Deck plugin requires very little data, I can see other projects having a wide variety of use-cases that may benefit from the extra data.

If you plan to make an external websocket server, you can fork this repository and remove any unnecessary data in the app.tsx SendUpdate function to optimise bandwidth usage.

I do get that some of the data (is_buffering for instance) is probably highly unnecessary, but you never know. My goal for this project is to create a developer-friendly API that just works without that much hassle.
