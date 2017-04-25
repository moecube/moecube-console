FROM node

RUN apt-get update
RUN apt-get install aria2 -y

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN npm install

COPY . /usr/src/app

EXPOSE  8080
CMD ["./entrypoint.sh"]
