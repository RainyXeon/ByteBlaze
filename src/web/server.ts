import { Manager } from '../manager.js'
import Fastify from 'fastify'
import WebsocketPlugin from '@fastify/websocket'
import { WebsocketRoute } from './websocket.js'
import { PlayerRoute } from './player.js'
import { getSearch } from './route/getSearch.js'
import { getCommands } from './route/getCommands.js'
import http from 'node:http'

export class WebServer {
  app: Fastify.FastifyInstance
  server: http.Server
  constructor(private client: Manager) {
    this.app = Fastify({
      logger: false,
      serverFactory: (handler, opts) => {
        this.server = http.createServer((req, res) => {
          handler(req, res)
        })
        return this.server
      },
    })

    this.app.register(
      (fastify, _, done) => {
        fastify.addHook('preValidation', function hook(req, reply, done) {
          if (!req.headers['authorization']) {
            reply.code(400)
            reply.send(JSON.stringify({ error: 'Missing Authorization' }))
            return done()
          }
          if (req.headers['authorization'] !== client.config.utilities.WEB_SERVER.auth) {
            reply.code(401)
            reply.send(JSON.stringify({ error: 'Authorization failed' }))
            return done()
          }
          if (
            client.config.utilities.WEB_SERVER.whitelist.length !== 0 &&
            !client.config.utilities.WEB_SERVER.whitelist.includes(req.hostname)
          ) {
            reply.code(401)
            reply.send(JSON.stringify({ error: "You're not in whitelist" }))
            return done()
          }
          done()
        })
        fastify.register(WebsocketPlugin)
        fastify.register((fastify, _, done) => {
          new WebsocketRoute(client).main(fastify)
          done()
        })
        fastify.register(
          (fastify, _, done) => {
            new PlayerRoute(client).main(fastify)
            done()
          },
          { prefix: 'players' }
        )
        fastify.get('/search', (req, res) => getSearch(client, req, res))
        fastify.get('/commands', (req, res) => getCommands(client, req, res))
        done()
      },
      { prefix: 'v1' }
    )

    this.app.get('/catgirls', (request, reply) => {
      const response = [
        'Bro 💀',
        'Please stop...',
        "This ain't rule 34...",
        '💀',
        'Can you do something better please -_-',
        "Don't be like yandev ._.",
        'Why you still here >:v',
        'I know catgirls do nothing wrong but why you still here...',
        "Bro, I don't have any catgirls collection (or cosplay collection) so please leave...",
      ]
      client.logger.info('HealthRouterService', `${request.method} ${request.routeOptions.url}`)
      reply.send({ byteblaze: response[Math.floor(Math.random() * response.length)] })
    })

    const port = this.client.config.utilities.WEB_SERVER.port

    this.app.ready(() => {
      this.server.listen({ port: 8080 })
      this.client.logger.info(WebServer.name, `Server running at port ${port}`)
    })
  }
}
