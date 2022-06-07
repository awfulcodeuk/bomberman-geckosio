import { Scene } from 'phaser'
import axios from 'axios'

import { SnapshotInterpolation, Vault } from '@geckos.io/snapshot-interpolation'
const SI = new SnapshotInterpolation(15) // 15 FPS

const playerVault = new Vault()

import Cursors from '../components/cursors.js'
import FullscreenButton from '../components/fullscreenButton.js'

// imports for components
import Player from '../components/Player.js'
import Block from '../components/Block.js'
import Bomb from '../components/Block.js'
import Explosion from '../components/Explosion.js'

export default class GameScene extends Scene {
  constructor() {
    super({ key: 'GameScene' })
    this.playerId
    
    this.avatars = new Map()
    this.blocks = new Map()
    this.bombs = new Map()

    this.bombCoolDown = false
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

  create() {
    this.physics.world.setBounds(64, 64, 704, 768)
    // create physics groups
    this.physicsBlocks = this.physics.add.staticGroup()
    this.physicsAvatars = this.physics.add.group()
    this.physicsBombs = this.physics.add.group()

    this.cursors = this.input.keyboard.createCursorKeys()

    this.bombKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)

    this.add.sprite(0,0,'background').setScale(2)

    this.channel.on('snapshot', snapshot => {
      SI.snapshot.add(snapshot)
    })
    
    this.input.mouse.disableContextMenu()

    
    this.physics.add.collider(this.physicsAvatars,this.physicsBlocks,function (avatar,block) {
      //console.log('block x: ' + block.x + ' y: ' + block.y)
      //console.log('avatar x: ' + avatar.x + ' y: ' + avatar.y)
    })


    this.physics.add.collider(this.physicsAvatars, this.physicsBombs)
    new Cursors(this, this.channel)

    FullscreenButton(this)

    this.channel.emit('getId')
    
    this.channel.on('getId', playerId36 => {
      this.playerId = parseInt(playerId36, 36)
      console.log(this.playerId)
      this.channel.emit('addPlayer')
    })

    this.channel.on('removePlayer', playerId => {
      try {
        this.objects[playerId].sprite.destroy()
        delete this.objects[playerId]
      } catch (error) {
        console.error(error.message)
      }
    })
  }

  update() {
    this.channel.on('tooManyPlayers', playerCount => {
      console.log('Too many players already: ' + playerCount)
    })
    const snap = SI.calcInterpolation('x y', 'players')
    const blockSnap = SI.calcInterpolation('x y', 'blocks')
    const bombSnap = SI.calcInterpolation('x y', 'bombs')

    if (!snap  || !blockSnap || !bombSnap) return

    const { state } = snap
    const blockState = blockSnap.state
    const bombState = bombSnap.state
    
    if (!state || !blockState || !bombState) return

    blockState.forEach(block => {
      const exists = this.blocks.has(block.id)

      if (!exists) {
        const _block = new Block({scene: this, x: block.x, y: block.y, blockType: block.blockType, blockID: block.id})
        this.blocks.set(block.id, 
          { block: _block }
          )
      } else {
        const _block = this.blocks.get(block.id).block
        _block.setX(block.x)
        _block.setY(block.y)
      }
    })

    bombState.forEach(bomb => {
      const exists = this.bombs.has(bomb.id)

      if (!exists) {
        const _bomb = new Bomb({scene: this, x: bomb.x, y: bomb.y, frame: 'bomb_regular'})
        this.bombs.set(bomb.id, 
          { bomb: _bomb }
          )
        _bomb.anims.play('bomb_regular_lit', true)
      } else {
        const _bomb = this.bombs.get(bomb.id).bomb
      }
    })

    const movement = {
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown,
      up: this.cursors.up.isDown,
      down: this.cursors.down.isDown
    }
    
    state.forEach(avatar => {
      const exists = this.avatars.has(avatar.id)
      if (!exists) {
        const frame = 'player_' + avatar.playerNumber
        const _avatar = new Player(this, avatar.playerNumber, avatar.x, avatar.y, frame)
        _avatar.setX(avatar.x)
        _avatar.setY(avatar.y)
        _avatar.setData({playerAnimFrame: avatar.playerAnimFrame})
        this.avatars.set(avatar.id, { avatar: _avatar })
      } else {
        //if (avatar.id != this.socket.id) {
          const _avatar = this.avatars.get(avatar.id).avatar
          _avatar.setX(avatar.x)
          _avatar.setY(avatar.y)
          _avatar.setData({playerAnimFrame: avatar.playerAnimFrame})
          _avatar.anims.play(_avatar.getData('playerAnimFrame'),true)
        //}
      }
    })

    //this.clientPrediction(movement)

    //this.serverReconciliation(movement)
    
    this.channel.emit('playerMove', movement)

    if (this.bombKey.isDown && !this.bombCoolDown) {
      this.bombCoolDown = true
      const droppingPlayer = this.avatars.get(this.channel.id).avatar
      this.channel.emit('dropBomb', {x: droppingPlayer.x, y: droppingPlayer.y})
      setTimeout(() => this.bombCoolDown = false, 1000)
    }
  }
}
