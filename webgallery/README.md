# Project Webgallery

This is a project to highlight my skills as a web developer. This project tries to remain as close to low level stuff as possible hence avoiding to use any frontend javascript framework. It uses node js to run an express based server which serves the static files for the frontend and handles the requests. The app has been secured from most basic cybersecurity attacks by using input-sanitation, and using clamscan to handle secure uplaods of the files. The server supports both HTTPS and HTTP depending upon the environment it is run in. An HTTPS certificate and private key will have to be generated first using the command 
```
openssl req -nodes -new -x509 -keyout server.key -out server.cert -days 365
```
after which using the

```
npm run start
``` 
command can be used in terminal to start the server at https://localhost:3000. Then you will be presented with a registration page where you can either Sign up or Sign In. After authorization you are redirected to the hoem page of the app where you can view other user's pictures, comment on them and upload your pictures for others to see as well. 


You will need clamav package installed on the host machine to use the clamscan npm package. On Arch linux command is 
```
$ sudo pacman -S clamav
```
and on Ubuntu it is installed by 
```
$ sudo apt-get install clamav clamav-daemon
```
