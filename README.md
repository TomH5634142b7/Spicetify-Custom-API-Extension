# Spicetify Custom API Extension
This extension was built to integrate the Stream Deck into Spotify without needing to use the Spotify Web API.

Click [here](https://github.com/TomH5634142b7/Spotify-Integration-Stream-Deck-Plugin) for the Spotify integration Stream Deck plugin.

# Installation & Usage
## Installation

## Usage
If you're using this extension with the Stream Deck plugin you can download and install the plugin from the [plugin GitHub repo](https://github.com/TomH5634142b7/Spotify-Integration-Stream-Deck-Plugin) or from the ~~Elgato marketplace~~ (Coming soon) and the plugin will handle everything for you.


If you're developing your own program to communicate with Spotify, you'll need to create a websocket server listening to port 22157. Every 250ms the extension will send Spotify info to the websocket server in a stringified JSON format.
For example:

Player position & song duration are in milliseconds to allow for more customisable humanised formatting options.

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

I do get that some of the data (page_instance_id or is_buffering for instance) is probably highly unnecessary, but you never know. My goal for this project is to create a developer-friendly API that just works without that much hassle.
