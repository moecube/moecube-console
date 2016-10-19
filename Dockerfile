FROM node

RUN apt-get update
RUN apt-get install -y gdebi-core
RUN wget https://repo.varnish-cache.org/pkg/5.0.0/varnish_5.0.0-1_amd64.deb
RUN gdebi -n varnish_5.0.0-1_amd64.deb
RUN rm varnish_5.0.0-1_amd64.deb

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
COPY npm-shrinkwrap.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

CMD [ "./entrypoint.sh" ]
