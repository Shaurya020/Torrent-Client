# Torrent Client

## Description
This is a torrent client built on bittorrent protocol, using NodeJS. It supports both single file as well as multi-file torrents.

## Guidelines to Setup
1. Clone the project ```git clone https://github.com/Shaurya020/Torrent-Client ```
2. Run ```npm install``` in project's root directory
3. To run the client, enter command:
   ```node index.js <file path of torrent metadata file>```
4. tracker.js -> line 15: increment index of announce list if no response is received. Set index 0 initially if default doesn't work(default is 2)

## Scope for improvement
- Automate process of iteration over index of announce list (URLs)
- Add download speed and expected time of completion in Progress Bar.
- Add feature to stop and resume download.
- Reconnecting dropped connection.
