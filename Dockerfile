FROM node:alpine
# Create the bot's directory
RUN mkdir -p /main/bot
WORKDIR /main/bot
ENV NODE_PATH=/usr/local/lib/node_modules
COPY package.json /main/bot
COPY tsconfig.json /main/bot
RUN npm i -g pnpm
RUN pnpm i
COPY . /main/bot
ENV NODE_PATH=/usr/local/lib/node_modules
LABEL name="byteblaze" version="5.0"
# Start the bot.
RUN pnpm build:full
CMD ["pnpm", "start"]