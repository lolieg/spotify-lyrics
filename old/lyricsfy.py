import spotipy
from spotipy.oauth2 import SpotifyOAuth
from config import CLIENT_ID, CLIENT_SECRET, USERNAME, LYRICS_API
from flask import Flask, render_template
import requests
import time
from bs4 import BeautifulSoup, PageElement

scope = "user-read-currently-playing"
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(scope=scope, client_id=CLIENT_ID, client_secret=CLIENT_SECRET, username=USERNAME, redirect_uri="http://localhost:8080"))

def get_song():
    playing = sp.currently_playing()
    if not playing: return "No Song Playing."

    name = playing["item"]["name"]
    artist = playing["item"]["artists"][0]["name"]
    resp = requests.get(f"https://api.genius.com/search?q={name} {artist}", headers={"Authorization" : f"Bearer {LYRICS_API}"})
    json_resp = resp.json()
    # api_path = json_resp["response"]["hits"][0]["result"]["api_path"]
    # resp = requests.get(f"https://api.genius.com{api_path}", headers={"Authorization" : f"Bearer {LYRICS_API}"})
    # json_resp = resp.json()

    with open("resp.json", "w") as fp:
        import json
        json.dump(json_resp, fp, indent=4)

    return json_resp["response"]["hits"][0]["result"]["api_path"], json_resp["response"]["hits"][0]["result"]["title"]

def lyrics_from_song_api_path(song_api_path):
    song_url = "https://api.genius.com" + song_api_path
    response = requests.get(song_url, headers={"Authorization" : f"Bearer {LYRICS_API}"})
    json = response.json()
    path = json["response"]["song"]["path"]
    #gotta go regular html scraping... come on Genius
    page_url = "http://genius.com" + path
    page = requests.get(page_url)
    html = BeautifulSoup(page.text, "html.parser")
    #remove script tags that they put in the middle of the lyrics
    [h.extract() for h in html('script')]
    #at least Genius is nice and has a tag called 'lyrics'!
    lyrics = html.find("div", class_="lyrics")
    return str(lyrics)

app = Flask(__name__)

@app.route("/")
def index():
    api_path, title = get_song()
    lyrics = lyrics_from_song_api_path(api_path)
    
    return render_template("index.html", lyrics=lyrics, title=title)

app.run()

