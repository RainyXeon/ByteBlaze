### ByteBlaze

A versatile and powerful music bot for Discord that brings rhythm and melody to your server. This is a big upgrade of Cylane!

## 📑 Short Feature

- [x] Full typescript for avoid error in production
- [x] Music System
- [x] Multi Language
- [x] Playlist Network
- [x] SlashCommand
- [x] ContextMenus
- [x] Custom Filters
- [x] Play music from file
- [x] Easy to use
- [x] Autocomplete (Play command)
- [x] Auto restore lavalink (Get from [lavalink.darrennathanael.com](https://lavalink.darrennathanael.com/NoSSL/lavalink-without-ssl/) sources)

## 🎶 Support Source

- [x] Youtube
- [x] SoundCloud
- [x] Spotify
- [x] Https (Radio)
- [x] Deezer
- [x] Twitch
- [x] Bandcamp
- [x] NicoVideo

## 🎶 Support Database

- [x] Mysql
- [x] Mongo DB
- [x] JSON

<details><summary>📎 Requirements [CLICK ME]</summary>
<p>

## 📎 Requirements

1. Node.js Version 16.6.0+ **[Download](https://nodejs.org/en/download/)**
2. Discord Bot Token **[Guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)**
3. LavaLink **[Guide](https://github.com/freyacodes/lavalink)** (i use this development version [Download](https://ci.fredboat.com/repository/downloadAll/Lavalink_Build/9311:id/artifacts.zip) )
4. MongoDB **[Download](https://www.mongodb.com/try/download/community)** (Download & install = Finish!)

## 🛑 Super Requirements

Java 11-13 **[Download JDK13](http://www.mediafire.com/file/m6gk7aoq96db8g0/file)** (i use this version) for LAVALINK!

</p>
</details>

## 📚 Installation

```
git clone https://github.com/RainyXeon/ByteBlaze
cd ByteBlaze
Start.bat
```

<details><summary>📄 Configuration [CLICK ME]</summary>
<p>

## 📄 Configuration

Copy or Rename `application.example.yml` to `application.yml` and fill out the values:

```yaml
# ByteBlaze config file via .yaml
# Version 3.0
# You can use ${} to pass an enviroment varible from .env file
# Eg:
# something: ${DATA}

bot:
  TOKEN: Your token
  EMBED_COLOR: "#2b2d31"
  OWNER_ID: "Your id"
  LANGUAGE: en # You can set it to vi, en, th,...
  LIMIT_TRACK: 50 # The number of tracks you want to limit
  LIMIT_PLAYLIST: 20 # The number of playlist you want to limit

lavalink:
  SPOTIFY:
    # Your spotify id and secret, you can get it from here: https://developer.spotify.com/
    # If you don't have or don't want, you can disable it
    enable: false
    id: a98a98s9a89as98a9s8a98
    secret: a98a98s9a89as98a9s8a98

  DEFAULT: ["yorushika", "yoasobi", "tuyu", "hinkik"]

  NP_REALTIME: false # Enable this if you want to use realtime duation in nowplaying command

  LEAVE_TIMEOUT: 100 # The number of leave time you want

  # You can add more lavalink server!
  NODES:
    [
      {
        url: "localhost:2333",
        name: "Lavalink_Server",
        auth: "youshallnotpass",
        secure: false,
      },
    ]
  SHOUKAKU_OPTIONS:
    {
      moveOnDisconnect: true,
      resumable: true,
      resumableTimeout: 600,
      reconnectTries: Infinity,
      restTimeout: 3000,
    }

features:
  DATABASE:
    # Note: You can't enable all or 2 databases. It will return to JSON database
    JSON:
      enable: true
      path: "./cylane.database.json"
    MONGO_DB:
      enable: false
      # Your mongo_uri, you can get it from here: https://www.mongodb.com/
      uri: mongodb://127.0.0.1:27017/dreamvast
    MYSQL:
      enable: false
      host: "localhost"
      user: "me"
      password: "secret"
      database: "my_db"

  MESSAGE_CONTENT:
    enable: true
    prefix: "d!" # The prefix you want

  AUTO_DEPLOY: true
  AUTO_REMOVE_DUPLICATE: true
  AUTOFIX_LAVALINK: true # Fix the lavalink server when the current is down

  ALIVE_SERVER:
    enable: false
    port: 3000

  WEBSOCKET:
    enable: false
    port: 8080
    auth: false
    trusted: ["http://localhost:3000"]

  # Your id or friend id (disable global command)
  DEV_ID: []
```

If you want to use environment variables from `.env` file, you can use the `${}` in `application.yml` file.

Examples:

```env
NODE_AUTH=foo
```

```yaml
bar: ${NODE_AUTH}
```

### Output: { bar: foo }

---

After installation or finishes all you can use `npm start` to start the bot. or `Run Start.bat`

</p>
</details>

<details><summary>🐋 Docker Installation</summary>
<p>

## 🐋 Docker Installation

### **1. What is Docker 🐋?**

Docker is an open platform for developing, shipping, and running applications. Docker enables you to separate your applications from your infrastructure so you can deliver software quickly. With Docker, you can manage your infrastructure in the same ways you manage your applications. By taking advantage of Docker’s methodologies for shipping, testing, and deploying code quickly, you can significantly reduce the delay between writing code and running it in production.

### **2. What are the advantages and disadvantages of docker?**

#### The Advantages:

- Consistency
- Automation
- Stability
- Saves Space
- Run multiple applications with just one virtual machine

#### The Disadvantages:

- Advances Quickly
- Learning Curve

### **3. Install Docker 🐋:**

---

#### For windows:

**1. Go to the website https://docs.docker.com/docker-for-windows/install/ and download the docker file.**

> **_Note: A 64-bit processor and 4GB system RAM are the hardware prerequisites required to successfully run Docker on Windows 10._**

**2. Then, double-click on the Docker Desktop Installer.exe to run the installer.**

> **_Note: Suppose the installer (Docker Desktop Installer.exe) is not downloaded; you can get it from Docker Hub and run it whenever required._**

**3. Once you start the installation process, always enable Hyper-V Windows Feature on the Configuration page.**

**4. Then, follow the installation process to allow the installer and wait till the process is done.**

**5. After completion of the installation process, click Close and restart.**

##### Guide source: https://www.simplilearn.com/tutorials/docker-tutorial/install-docker-on-windows

---

#### For linux (Ubuntu):

**1. Open the terminal on Ubuntu.**

**2. Remove any Docker files that are running in the system, using the following command:**

```
sudo apt-get remove docker docker-engine docker.io
```

**3. Check if the system is up-to-date using the following command:**

```
sudo apt-get update
```

**4. Install a few pre-requisite packages that allow apt to use packages over HTTPS using the following command:**

```
sudo apt install apt-transport-https ca-certificates curl software-properties-common
```

**5. Then add the GPG key for the Docker repository to your system:**

```
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable"
```

**6. Update the packages list again with Docker packages from the newly added repo:**

```
sudo apt update
```

**7. Make sure you are about to install from the Docker repo instead of the default Ubuntu repo:**

```
apt-cache policy docker-ce
```

Example Output:

```
docker-ce:
  Installed: (none)
  Candidate: 18.03.1~ce~3-0~ubuntu
  Version table:
     18.03.1~ce~3-0~ubuntu 500
        500 https://download.docker.com/linux/ubuntu bionic/stable amd64 Packages

```

**8. Install Docker:**

```
sudo apt install docker-ce
```

**9. Check if Docker is installed and running:**

```
sudo systemctl status docker
```

Example Output:

```
● docker.service - Docker Application Container Engine
   Loaded: loaded (/lib/systemd/system/docker.service; enabled; vendor preset: enabled)
   Active: active (running) since Thu 2018-07-05 15:08:39 UTC; 2min 55s ago
     Docs: https://docs.docker.com
 Main PID: 10096 (dockerd)
    Tasks: 16
   CGroup: /system.slice/docker.service
           ├─10096 /usr/bin/dockerd -H fd://
           └─10113 docker-containerd --config /var/run/docker/containerd/containerd.toml
```

##### Guide source: https://viblo.asia/p/how-to-install-docker-on-ubuntu-RnB5pmJ7KPG

### **4. Install Dreamvast using Docker 🐋:**

---

**1. Make sure you config the .env file or the config.js file in ./src/plugins/config.js**

**2. Change to the Discord bot project directory.**

**3. Build the docker container for the Discord bot.**

```
docker build -t cylane .
```

**4. Run the docker container.**

```
docker run -d cylane
```

---

#### Basic commands:

**1. To build the docker container, using the following command: (Please remove the [] when you type the name)**

```
docker build -t [name] .
```

_The `-t` option is the tag name option._

**2. To run the docker container, using the following command: (Please remove the [] when you type the name)**

```
docker run -d [name]
```

_The `-d` option is runs the container in detached mode (it runs in the background)._

**3. To list all docker processes and container id, using the following command:**

```
docker ps
```

**4. To see all docker container log, using the following command: (Please remove the [] when you paste the id)**

```
docker logs [container id]
```

**5. To stop the docker container, using the following command: (Please remove the [] when you paste the id)**

```
docker stop [container id]
```

**6. To restart the docker container, using the following command: (Please remove the [] when you paste the id)**

```
docker restart [container id]
```

**7. To remove the docker container, using the following command: (Please remove the [] when you paste the id)**

```
docker rm [container id]
```

---

</p>
</details>

<details><summary>🐋 Docker all in one hosting command</summary>
<p>

### Installation

**Use this command and you're done! (Make sure you have edited application.yml file)**

```
docker-compose up -d --build
```

**All commands are exactly the same as the one above, just change from `docker` to `docker-compose` and change from `[container id]` to `[name]`**

</p>
</details>

<details><summary>❓ FAQ</summary>
<p>

### 1. How to enable search in setup channel?

Just add `ENABLE_MESSAGE=true` on `.env` and make sure you have enabled `MESSAGE CONTENT INTENT` at the developer portal

</p>
</details>

<details><summary>🕸️ Websocket enum [UNFINISHED]</summary>
<p>

- OP Code (Player Status):

  - 0: `player_destroy`
  - 1: `player_create`
  - 2: `player_start`
  - 3: `pause_track`
  - 4: `resume_track`
  - 5: `skiped_track`
  - 6: `previous_track`
  - 7: `add` (later)
  - 8: `loop_queue`
  - 9: `unloop_queue`
  - 10: `search` (queue or track)
  - 11: `shuffle_queue`
  - 12: `voice_state_update_join`
  - 13: `voice_state_update_leave`
  - 15: `player_queue`
  - 16: `player_end`

- Error code:

```
0x100: No player on this guild
0x105: No previous track
0x110: Only 1 - 2 params
0x115: No user's id provided
0x120: No guild's id provided
```

</p>
</details>

## 🛑 Super Requirements

Java 11-13 **[Download JDK13](http://www.mediafire.com/file/m6gk7aoq96db8g0/file)** (i use this version) for LAVALINK!

## Special thanks

- [@DarrenOfficial](https://github.com/DarrenOfficial) [Lavalink Sources]
- [@Pain6900](https://github.com/Pain6900) [My friend]
- [@Adivise](https://github.com/Adivise) [Framework]
- [@mrstebo](https://github.com/mrstebo) [env praser]
- And everyone who starred and contribute my project 💖
