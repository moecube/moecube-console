FROM node

RUN apt-get update
RUN apt-get install aria2 -y
RUN npm install yarn -g

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN yarn install

COPY . /usr/src/app

EXPOSE  8080
CMD ["./entrypoint.sh"]
