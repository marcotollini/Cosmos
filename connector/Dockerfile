# set base image (host OS)
FROM python:3.8

RUN apt-get update
RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_14.x  | bash -
RUN apt-get -y install nodejs
RUN npm install -g nodemon

# set the working directory in the container
WORKDIR /code

# copy the dependencies file to the working directory
COPY requirements.txt .

# install dependencies
RUN pip install -r requirements.txt && pip install watchdog[watchmedo]

# copy the content of the local src directory to the working directory
COPY ./ .

# command to run on container start
CMD ["nodemon", "--exec", "python", "-u", "main.py", "-f", "librdkafka.config", "-t", "nfacctd_bmp"]