import { Scene } from 'phaser'
import axios from 'axios'
import Player from '../components/player.js'
import Cursors from '../components/cursors.js'
import FullscreenButton from '../components/fullscreenButton.js'

// imports for components
import Block from '../components/Block.js'
import Bomb from '../components/Block.js'
import Explosion from '../components/Explosion.js'

export default class GameScene extends Scene {
  constructor() {
    super({ key: 'GameScene' })
    this.objects = {}
    this.playerId
  }

  init({ channel }) {
    this.channel = channel
  }

  preload() {
    this.load.image('background', '../assets/stage_01_background.png')

    this.load.image('edge_block', '../assets/stage_01_edge_block.png')
    this.load.image('static_block', '../assets/stage_01_static_block.png')
    this.load.image('breakable_block', '../assets/stage_01_breakable_block.png')

    this.load.atlas('player_1', '../assets/players_01.png', '../assets/players_01_atlas.json')
    this.load.atlas('player_2', '../assets/players_02.png', '../assets/players_02_atlas.json')
    this.load.atlas('player_3', '../assets/players_03.png', '../assets/players_03_atlas.json')
    this.load.atlas('player_4', '../assets/players_04.png', '../assets/players_04_atlas.json')
    this.load.atlas('bomb_regular', '../assets/items_effects.png', '../assets/bomb_regular_atlas.json')
    this.load.atlas('explosion_centre', '../assets/items_effects.png', '../assets/explosion_centre_atlas.json')
    this.load.atlas('explosion_north', '../assets/items_effects.png', '../assets/explosion_north_atlas.json')
    this.load.atlas('explosion_north_end', '../assets/items_effects.png', '../assets/explosion_north_end_atlas.json')
    this.load.atlas('explosion_east', '../assets/items_effects.png', '../assets/explosion_east_atlas.json')
    this.load.atlas('explosion_east_end', '../assets/items_effects.png', '../assets/explosion_east_end_atlas.json')
    this.load.atlas('explosion_south', '../assets/items_effects.png', '../assets/explosion_south_atlas.json')
    this.load.atlas('explosion_south_end', '../assets/items_effects.png', '../assets/explosion_south_end_atlas.json')
    this.load.atlas('explosion_west', '../assets/items_effects.png', '../assets/explosion_west_atlas.json')
    this.load.atlas('explosion_west_end', '../assets/items_effects.png', '../assets/explosion_west_end_atlas.json')
    

    this.load.animation('player_1_anim', '../assets/players_01_anim.json')
    this.load.animation('player_2_anim', '../assets/players_02_anim.json')
    this.load.animation('player_3_anim', '../assets/players_03_anim.json')
    this.load.animation('player_4_anim', '../assets/players_04_anim.json')
    this.load.animation('bomb_regular_anim', '../assets/bomb_regular_anim.json')
    this.load.animation('explosion_centre_anim', '../assets/explosion_centre_anim.json')
    this.load.animation('explosion_north_anim', '../assets/explosion_north_anim.json')
    this.load.animation('explosion_north_end_anim', '../assets/explosion_north_end_anim.json')
    this.load.animation('explosion_east_anim', '../assets/explosion_east_anim.json')
    this.load.animation('explosion_east_end_anim', '../assets/explosion_east_end_anim.json')
    this.load.animation('explosion_south_anim', '../assets/explosion_south_anim.json')
    this.load.animation('explosion_south_end_anim', '../assets/explosion_south_end_anim.json')
    this.load.animation('explosion_west_anim', '../assets/explosion_west_anim.json')
    this.load.animation('explosion_west_end_anim', '../assets/explosion_west_end_anim.json')
  }

  async create() {
    this.physics.world.setBounds(64, 64, 704, 768)
    // create physics groups
    this.physicsBlocks = this.physics.add.staticGroup()
    this.physicsAvatars = this.physics.add.group()
    this.physicsBombs = this.physics.add.group()

    this.cursors = this.input.keyboard.createCursorKeys()

    this.bombKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)

    this.add.sprite(0,0,'background').setScale(2)

    new Cursors(this, this.channel)

    FullscreenButton(this)

    const parseUpdates = updates => {
      if (typeof updates === undefined || updates === '') return []

      // parse
      let u = updates.split(',')
      u.pop()

      let u2 = []

      u.forEach((el, i) => {
        if (i % 4 === 0) {
          u2.push({
            playerId: u[i + 0],
            x: parseInt(u[i + 1], 36),
            y: parseInt(u[i + 2], 36),
            dead: parseInt(u[i + 3]) === 1 ? true : false
          })
        }
      })
      return u2
    }

    const updatesHandler = updates => {
      updates.forEach(gameObject => {
        const { playerId, x, y, dead } = gameObject
        const alpha = dead ? 0 : 1

        if (Object.keys(this.objects).includes(playerId)) {
          // if the gameObject does already exist,
          // update the gameObject
          let sprite = this.objects[playerId].sprite
          sprite.setAlpha(alpha)
          sprite.setPosition(x, y)
        } else {
          // if the gameObject does NOT exist,
          // create a new gameObject
          let newGameObject = {
            sprite: new Player(this, playerId, x || 200, y || 200),
            playerId: playerId
          }
          newGameObject.sprite.setAlpha(alpha)
          this.objects = { ...this.objects, [playerId]: newGameObject }
        }
      })
    }

    this.channel.on('updateObjects', updates => {
      let parsedUpdates = parseUpdates(updates[0])
      updatesHandler(parsedUpdates)
    })

    this.channel.on('removePlayer', playerId => {
      try {
        this.objects[playerId].sprite.destroy()
        delete this.objects[playerId]
      } catch (error) {
        console.error(error.message)
      }
    })

    try {
      let res = await axios.get(`${location.protocol}//${location.hostname}:1444/getState`)

      let parsedUpdates = parseUpdates(res.data.state)
      updatesHandler(parsedUpdates)

      this.channel.on('getId', playerId36 => {
        this.playerId = parseInt(playerId36, 36)
        this.channel.emit('addPlayer')
      })

      this.channel.emit('getId')
    } catch (error) {
      console.error(error.message)
    }
  }
}
