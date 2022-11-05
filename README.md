# Build image

first run:
`cd plcux-client`

`npm install && ng build --prod`

this will build the client and put it in `dist/`

then run:

`docker build -t <image-name>:<tag> .`

# run image:

`docker run -d -p <port>:3000 <image-name>:<tag>`