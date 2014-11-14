========
HIRA
========

During emergencies, a wealth of information relevant to humanitarian decision makers is available through news media, NGOs reports, social media, meeting minutes, government press release, etc. Unfortunately, this information is not systematically captured and analysed in real time, mainly due to a lack of time. Capturing this information requires manpower and a collaborative, systematic and thorough way of screening all new available information, tagging them by field of interest and storing them in a tabular format to ease further analysis.

The Humanitarian Information Review and Analysis platform was developed to ease the process of data capture and tagging during emergencies and ensuring no important information is missed. It was developed by and for the Digital Humanitarian Network and will hopefully fill an important technological gap in the way humanitarian operators capture and perform secondary data review.

The platform is administered by a group of three organizations, namely DHN, OCHA and ACAPS who are responsible for the appropriate and safe use, maintenance and development of the platform.

### Requirements ###
- NodeJS >= 0.10.25
- npm >= 1.4.20

### Installation ###
```
npm install
bower instll
grunt --force
```

### Upstart script ###
*Assuming the code is located in /var/www/hira*

```
# node-hira.conf

description "start hira"

start on started networking
stop on runlevel [016]


limit nofile 1000000 1000000


console log

script
  
  mkdir -p /var/www/hira
  cd /var/www/hira
  
  export NODE_ENV="production"
  /usr/bin/nodejs /var/www/hira/dist/server/app.js
end script

respawn
```

### nginx virtual host ###
```
server {
    listen 80;

    server_name hira.example.com;

    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```


Platform code contributed by Itamar Maltz, Licensed under GPLv2 
