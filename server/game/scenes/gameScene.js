import geckos from '@geckos.io/server'
import { iceServers } from '@geckos.io/server'

import pkg from 'phaser'
const { Scene } = pkg

import path from 'path'
import fs from 'fs'

import { Player } from '../components/player.js'

// dir and filenames
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// imports for components
import Block from '../components/Block.js'
import Bomb from '../components/Block.js'
import Explosion from '../components/Explosion.js'

// imports for stages
const stageBlocks = Object.values(JSON.parse(fs.readFileSync(__dirname + '/../stages/01.json', 'utf8')))

export class GameScene extends Scene {
  constructor() {
    super({ key: 'GameScene' })
    this.playerId = 0
    this.tick = 0
    this.blockID = 0
    this.players = new Map()
    this.blocks = new Map()
    this.bombs = new Map()
    this.spawnLocations = []
  }

  init() {
    this.io = geckos({
      iceServers: process.env.NODE_ENV === 'production' ? iceServers : []
    })
    this.io.addServer(this.game.server)
  }

  getId() {
    return this.playerId++
  }

  prepareToSync(player) {
    return `${player.playerId},${Math.round(player.x).toString(36)},${Math.round(player.y).toString(36)},${
      player.dead === true ? 1 : 0
    },`
  }

  getState() {
    let state = ''
    this.playersGroup.children.iterate(player => {
      state += this.prepareToSync(player)
    })
    return state
  }

  create() {
    this.playersGroup = this.add.group()

    this.physics.world.setBounds(64, 64, 704, 768)
    // create physics groups
    this.physicsBlocks = this.physics.add.staticGroup()
    this.physicsAvatars = this.physics.add.group()
    this.physicsBombs = this.physics.add.group()
    // create stage
    let rowCount = 0
    let colCount = 0
    let blockID = 0
    stageBlocks.forEach(rows => {
      rows.forEach(colEntry => {
        // "b" breakable blocks have a tiny chance of not being created. "e" edge and "s" static always are
        if (colEntry === "e" || colEntry === "s" || (colEntry === "b" && Math.random() > 0.05)) {
          let blockEntity = new Block({scene: this, x: (colCount * 64 + 32), y: (rowCount * 64 + 32), serverMode: true, blockType: colEntry, blockID: this.blockID})
          //exit
          blockID = this.blockID
          this.blocks.set(blockID, {
            blockID, 
            blockEntity
          })
          this.blockID++
        } else if (parseInt(colEntry) >= 1 && parseInt(colEntry) < 100 ) {
          // only values of 1 to 100 will create spawn points
          this.spawnLocations.push({x: (colCount * 64), y: (rowCount * 64)})
        }
        colCount++
      })
      colCount = 0
      rowCount++
    })

    this.io.onConnection(channel => {
      channel.onDisconnect(() => {
        console.log('Disconnect user ' + channel.id)
        this.playersGroup.children.each(player => {
          if (player.playerId === channel.playerId) {
            player.kill()
          }
        })
        channel.room.emit('removePlayer', channel.playerId)
      })


      channel.on('getId', () => {
        channel.playerId = this.getId()
        channel.emit('getId', channel.playerId.toString(36))
      })

      channel.on('playerMove', data => {
        this.playersGroup.children.iterate(player => {
          if (player.playerId === channel.playerId) {
            player.setMove(data)
          }
        })
      })

      channel.on('addPlayer', data => {
        let dead = this.playersGroup.getFirstDead()
        if (dead) {
          dead.revive(channel.playerId, false)
        } else {
          this.playersGroup.add(new Player(this, channel.playerId, Phaser.Math.RND.integerInRange(100, 700)))
        }
      })

      channel.emit('ready')
    })
  }

  update() {
    let updates = ''
    this.playersGroup.children.iterate(player => {
      let x = Math.abs(player.x - player.prevX) > 0.5
      let y = Math.abs(player.y - player.prevY) > 0.5
      let dead = player.dead != player.prevDead
      if (x || y || dead) {
        if (dead || !player.dead) {
          updates += this.prepareToSync(player)
        }
      }
      player.postUpdate()
    })

    if (updates.length > 0) {
      this.io.room().emit('updateObjects', [updates])
    }
  }
}
