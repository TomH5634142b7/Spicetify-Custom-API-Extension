# ⚠️ This is far from complete.
This repo is here to show what's to come.

I will be publishing the extension here shortly after adding a few more features & working out the kinks.

# Spicetify Custom API Extension
This extension was built to integrate the Stream Deck into Spotify without needing to use the Spotify Web API.

Click [here](https://github.com/TomH5634142b7/Spotify-Integration-Stream-Deck-Plugin) for the Spotify integration Stream Deck plugin.

# Installation & Usage
## Installation

## Stream Deck Usage
If you're using this extension with the Stream Deck plugin you can download and install the plugin from the [plugin GitHub repo](https://github.com/TomH5634142b7/Spotify-Integration-Stream-Deck-Plugin) or from the ~~Elgato marketplace~~ (Coming soon) and the plugin will handle everything for you.

## Developer Usage
If you're developing your own program to communicate with Spotify, you'll need to create a websocket server listening to port 22157. Everytime there's a player update (song change, player position update, volume update, etc) the extension will send info from Spotify to the websocket server in a stringified JSON format.
For example:
```json
In progress
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
In progress
```

# FAQ
## Why?
The Web API is good, but it has its pitfalls.

You have to always be online and BarRaider's Spotify plugin for the Stream Deck is pretty delayed to avoid Web API rate-limits.

Because of this, I decided to make this extension to go with my own custom Stream Deck plugin.

## Why not use WebNowPlaying?
Using WebNowPlaying was my original goal, but I later realised this may cause compatibility issues with Rainmeter due to the same port (8974) being used for both websocket servers.

Instead of looking for other ways to use WebNowPlaying, I realised I could make something that works for more than just me. A more developer-friendly Spotify websocket API.

## Why send so much data over to the websocket server?
Even though my Stream Deck plugin requires very little data, I can see other projects having a wide variety of use-cases that may benefit from the extra data.

I do get that some of the data is probably highly unnecessary, but you never know. My goal for this project is to create a developer-friendly API that just works without that much hassle.

## What if I want to create an external websocket server for Spicetify to send info to?
You'll need to fork this repository and then modify the `new WebSocket("ws://localhost:22157")` line to `new WebSocket("ws://your-domain/your-websocket-path")`.

To optimise speed and bandwidth usage, you can then remove data you won't be using in the `SendUpdate()` function.

**Note**: I do not know if external websocket servers actually work with this project; I designed this to be used locally & have never tested it externally.
