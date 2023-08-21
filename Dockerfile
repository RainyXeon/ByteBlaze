FROM node:latest
# Create the bot's directory
RUN mkdir -p /main/bot
WORKDIR /main/bot
ENV NODE_PATH=/usr/local/lib/node_modules
COPY package.json /main/bot
COPY tsconfig.json /main/bot
RUN npm install
COPY . /main/bot
LABEL name="byteblaze" version="1.5"
# Start the bot.
CMD ["npm", "run", "start:docker"]