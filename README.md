# Project Webgallery

This project is a simple image repository built from ground up using html,css and javascript.This project tries to remain as close to low level stuff as possible hence has avoided use of any frontend javascript framework. It uses node js to run an express based server which serves the static files for the frontend and handles the requests. The app has been secured from most basic cybersecurity attacks by using input-sanitation, and ensuring secure uploads of the files. The server supports both HTTPS and HTTP depending upon the environment it is run in. An HTTPS certificate and private key will have to be generated first using the openssl to run it in production environment. The files will have to be placed in the server folder.

```
openssl req -nodes -new -x509 -keyout server.key -out server.cert -days 365
```

After which npm or yarn can be used to start the server in dev mode or production mode using
```
$ npm run dev
```
```
$ npm run start
``` 
respectively.The app first presents a registration page where you can either Sign up or Sign In. After authorization you are redirected to the home page of the app where you can view other user's pictures, comment on them and upload your pictures for others to see as well. 


You will need clamav package installed on the host machine to ensure secure file uploads. On Arch linux command is 
```
$ sudo pacman -S clamav
```
and on Ubuntu it is installed by 
```
$ sudo apt-get install clamav clamav-daemon
```
and on MacOS it can be installed by
```
$ brew install clamav
```