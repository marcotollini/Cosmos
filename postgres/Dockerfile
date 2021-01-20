# docker build --build-arg PG_VERSION=13 -t subzerocloud/pgtap:pg13 .
# docker build --build-arg PG_VERSION=12 -t subzerocloud/pgtap:pg12 .
# docker build --build-arg PG_VERSION=11 -t subzerocloud/pgtap:pg11 .
# docker build --build-arg PG_VERSION=10 -t subzerocloud/pgtap:pg10 .
# docker build --build-arg PG_VERSION=9.6 -t subzerocloud/pgtap:pg9 .
ARG PG_VERSION
FROM timescale/timescaledb:latest-pg${PG_VERSION}
LABEL maintainer="Andreas Wålm <andreas@walm.net>"
LABEL maintainer="Ludovic Claude <ludovic.claude@chuv.ch>"
LABEL maintainer="Ruslan Talpa <ruslan.talpa@gmail.com>"
LABEL maintainer="Marco Tollini <marco.tollini1@swisscom.com>"

ARG PGTAP_VERSION=v1.1.0
ENV DOCKERIZE_VERSION=v0.6.1

RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.8/main'>> /etc/apk/repositories \
    && echo 'http://dl-cdn.alpinelinux.org/alpine/v3.6/main'>> /etc/apk/repositories \
    && apk add --no-cache --update curl wget git openssl build-base make perl perl-dev \
    && rm -rf /var/cache/apk/* /tmp/*
    # && wget -O /tmp/dockerize.tar.gz https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-${DOCKERIZE_VERSION}.tar.gz \
    # && tar -C /usr/local/bin -xzvf /tmp/dockerize.tar.gz \

# install pg_prove
RUN cpan TAP::Parser::SourceHandler::pgTAP

# install pgtap
RUN git clone git://github.com/theory/pgtap.git \
    && cd pgtap \
    && git checkout tags/$PGTAP_VERSION \
    && make
