import { Scene } from 'phaser'
import axios from 'axios'

import { SnapshotInterpolation, Vault } from '@geckos.io/snapshot-interpolation'
const SI = new SnapshotInterpolation(15) // 15 FPS

const playerVault = new Vault()

//import FullscreenButton from '../components/fullscreenButton.js'

// imports for components
import Player from '../components/Player.js'
import Block from '../components/Block.js'
import Bomb from '../components/Bomb.js'
import Explosion from '../components/Explosion.js'
import Powerup from '../components/Powerup.js'

export default class GameScene extends Scene {
  constructor() {
    super({ key: 'GameScene' })
    this.playerId
    
    this.avatars = new Map()
    this.blocks = new Map()
    this.bombs = new Map()
    this.explosions = new Map()
    this.powerups = new Map()

    this.bombCoolDown = false
  }

  init({ channel }) {
    this.channel = channel
  }

  preload() {
    this.load.image('background', '../assets/stage_01_background.png')

    this.load.bitmapFont('atari', 'assets/fonts/atari-smooth.png', 'assets/fonts/atari-smooth.xml')

    this.load.image('edge_block', '../assets/stage_01_edge_block.png')
    this.load.image('static_block', '../assets/stage_01_static_block.png')
    this.load.image('breakable_block', '../assets/stage_01_breakable_block.png')
    this.load.image('ui_button', '../assets/ui_button.png')

    this.load.atlas('player_1', '../assets/players_01.png', '../assets/players_01_atlas.json')
    this.load.atlas('player_2', '../assets/players_02.png', '../assets/players_02_atlas.json')
    this.load.atlas('player_3', '../assets/players_03.png', '../assets/players_03_atlas.json')
    this.load.atlas('player_4', '../assets/players_04.png', '../assets/players_04_atlas.json')
    this.load.atlas('bomb_regular', '../assets/items_effects.png', '../assets/bomb_regular_atlas.json')
    this.load.atlas('powerups', '../assets/items_effects.png', '../assets/powerups_atlas.json')
    this.load.atlas('explosion_centre', '../assets/items_effects.png', '../assets/explosion_centre_atlas.json')
    this.load.atlas('explosion_north', '../assets/items_effects.png', '../assets/explosion_north_atlas.json')
    this.load.atlas('explosion_north_end', '../assets/items_effects.png', '../assets/explosion_north_end_atlas.json')
    this.load.atlas('explosion_east', '../assets/items_effects.png', '../assets/explosion_east_atlas.json')
    this.load.atlas('explosion_east_end', '../assets/items_effects.png', '../assets/explosion_east_end_atlas.json')
    this.load.atlas('explosion_south', '../assets/items_effects.png', '../assets/explosion_south_atlas.json')
    this.load.atlas('explosion_south_end', '../assets/items_effects.png', '../assets/explosion_south_end_atlas.json')
    this.load.atlas('explosion_west', '../assets/items_effects.png', '../assets/explosion_west_atlas.json')
    this.load.atlas('explosion_west_end', '../assets/items_effects.png', '../assets/explosion_west_end_atlas.json')
    this.load.atlas('stage_01_block_destruction', '../assets/stage_01_block_destruction.png', '../assets/stage_01_block_destruction_atlas.json')

    this.load.animation('player_1_anim', '../assets/players_01_anim.json')
    this.load.animation('player_2_anim', '../assets/players_02_anim.json')
    this.load.animation('player_3_anim', '../assets/players_03_anim.json')
    this.load.animation('player_4_anim', '../assets/players_04_anim.json')
    this.load.animation('bomb_regular_anim', '../assets/bomb_regular_anim.json')
    this.load.animation('powerups_anim', '../assets/powerups_anim.json')
    this.load.animation('explosion_centre_anim', '../assets/explosion_centre_anim.json')
    this.load.animation('explosion_north_anim', '../assets/explosion_north_anim.json')
    this.load.animation('explosion_north_end_anim', '../assets/explosion_north_end_anim.json')
    this.load.animation('explosion_east_anim', '../assets/explosion_east_anim.json')
    this.load.animation('explosion_east_end_anim', '../assets/explosion_east_end_anim.json')
    this.load.animation('explosion_south_anim', '../assets/explosion_south_anim.json')
    this.load.animation('explosion_south_end_anim', '../assets/explosion_south_end_anim.json')
    this.load.animation('explosion_west_anim', '../assets/explosion_west_anim.json')
    this.load.animation('explosion_west_end_anim', '../assets/explosion_west_end_anim.json')
    this.load.animation('stage_01_block_destruction', '../assets/stage_01_block_destruction_anim.json')

    this.load.audio('stage_01_bgm', '../assets/audio/bgm/stage_01_bgm.mp3')
    this.load.audio('bomb_bounce', '../assets/audio/effects/bomb_bounce.mp3')
    this.load.audio('bomb_explode', '../assets/audio/effects/bomb_explode.mp3')
    this.load.audio('bomb_place', '../assets/audio/effects/bomb_place.mp3')
    this.load.audio('kick', '../assets/audio/effects/kick.mp3')
    this.load.audio('kick_voice', '../assets/audio/effects/kick_voice.mp3')
    this.load.audio('item_get', '../assets/audio/effects/item_get.mp3')
  }

  create() {
    this.physics.world.setBounds(64, 64, 704, 768)
    // create physics groups
    this.physicsBlocks = this.physics.add.staticGroup()
    this.physicsAvatars = this.physics.add.group()
    this.physicsBombs = this.physics.add.group()
    this.physicsPowerups = this.physics.add.group()

    this.cursors = this.input.keyboard.createCursorKeys()

    this.bombKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)

    this.playerIsAlive = true

    this.add.sprite(0,0,'background').setScale(2)

    this.voteButton = this.add.sprite(927, 40,'ui_button').setInteractive()
    this.add.bitmapText(897, 20, 'atari', 'Vote').setFontSize(12)
    this.add.bitmapText(867, 40, 'atari', '(Re)start').setFontSize(12)
    
    this.voteButton.on('pointerup', () => {
      this.channel.emit('voteButton')
    })

    this.voteText = new Map()
    this.voteText.set(1, {
      voteStatusButton: this.add.bitmapText(870, 80, 'atari', '1').setFontSize(24).setTint(0x000000)
    })
    this.voteText.set(2, {
      voteStatusButton: this.add.bitmapText(900, 80, 'atari', '2').setFontSize(24).setTint(0x000000)
    })
    this.voteText.set(3, {
      voteStatusButton: this.add.bitmapText(930, 80, 'atari', '3').setFontSize(24).setTint(0x000000)
    })
    this.voteText.set(4, {
      voteStatusButton: this.add.bitmapText(960, 80, 'atari', '4').setFontSize(24).setTint(0x000000)
    })

    this.channel.on('snapshot', snapshot => {
      SI.snapshot.add(snapshot)
    })
    
    this.input.mouse.disableContextMenu()

    
    this.physics.add.collider(this.physicsAvatars, this.physicsBlocks)
    this.physics.add.collider(this.physicsAvatars, this.physicsBombs)

    this.physics.add.overlap(this.physicsAvatars, this.physicsBombs)

    //FullscreenButton(this)

    this.channel.emit('getId')
    
    this.channel.on('getId', playerId36 => {
        this.playerId = parseInt(playerId36, 36)
        this.channel.emit('addPlayer') 
    })

    this.channel.on('removePlayer', playerId => {
      //try {
      //  this.objects[playerId].sprite.destroy()
      //  delete this.objects[playerId]
      //} catch (error) {
      //  console.error(error.message)
      //}
    })

    const bgmMusic = this.sound.add('stage_01_bgm')

    bgmMusic.play()

  }

  update() {
    this.channel.on('tooManyPlayers', playerCount => {
      console.log('Too many players already: ' + playerCount)
    })
    const snap = SI.calcInterpolation('x y', 'players')
    const blockSnap = SI.calcInterpolation('x y', 'blocks')
    const bombSnap = SI.calcInterpolation('x y', 'bombs')
    const explosionSnap = SI.calcInterpolation('x y', 'explosions')
    const powerupsSnap = SI.calcInterpolation('x y', 'powerups')
    
    if (!snap  || !blockSnap || !bombSnap || !explosionSnap || !powerupsSnap) return

    const { state } = snap
    const blockState = blockSnap.state
    const bombState = bombSnap.state
    const explosionState = explosionSnap.state
    const powerupsState = powerupsSnap.state
    
    if (!state || !blockState || !bombState || !explosionState || !powerupsState) return

    blockState.forEach(block => {
      const exists = this.blocks.has(block.id)

      if (!exists) {
        const _block = new Block({scene: this, x: block.x, y: block.y, blockType: block.blockType, blockID: block.id, isDestroyed: block.isDestroyed})
        this.blocks.set(block.id, 
          { block: _block }
          )
      } else {
        const _block = this.blocks.get(block.id).block
        _block.setX(block.x)
        _block.setY(block.y)
        if (block.isDestroyed) {
          _block.setDestroyed()
        }
      }
    })

    bombState.forEach(bomb => {
      const exists = this.bombs.has(bomb.id)
      if (!exists) {
        const _bomb = new Bomb({scene: this, x: bomb.x, y: bomb.y, frame: 'bomb_regular'})
        this.bombs.set(bomb.id, 
          { bomb: _bomb }
          )
        if (bomb.isDestroyed) {
          _bomb.setDestroyed()
        }
      } else {
        const _bomb = this.bombs.get(bomb.id).bomb
        _bomb.setX(bomb.x)
        _bomb.setY(bomb.y)
        if (bomb.isDestroyed) {
          _bomb.setDestroyed()
        }
      }
    })

    powerupsState.forEach(powerup => {
      const exists = this.powerups.has(powerup.id)
      if (!exists) {
        const _powerup = new Powerup({scene: this, x: powerup.x, y: powerup.y, powerupType: powerup.powerupType, isBlownUp: powerup.isBlownUp, isDestroyed: powerup.isDestroyed})
        this.powerups.set(powerup.id, 
          { powerup: _powerup }
          )
      } else {
        const _powerup = this.powerups.get(powerup.id).powerup
        _powerup.setX(powerup.x)
        _powerup.setY(powerup.y)
        _powerup.isBlownUp = powerup.isBlownUp
        if (powerup.isDestroyed) {
          _powerup.setDestroyed()
        }
      }
    })

    const movement = {
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown,
      up: this.cursors.up.isDown,
      down: this.cursors.down.isDown
    }

    if (this.playerIsAlive) this.channel.emit('playerMove', movement)

    state.forEach(avatar => {
      const exists = this.avatars.has(avatar.id)
      if (!exists) {
        const frame = 'player_' + avatar.playerNumber
        const _avatar = new Player(this, avatar.playerNumber, avatar.x, avatar.y, frame)
        _avatar.setX(avatar.x)
        _avatar.setY(avatar.y)
        _avatar.setData({playerAnimFrame: avatar.playerAnimFrame})
        _avatar.speed = avatar.speed
        this.avatars.set(avatar.id, { avatar: _avatar })
        this.voteText.get(avatar.playerNumber).voteStatusButton.setTint(0x444444)
      } else {
        //if (avatar.id != this.socket.id) {
          const _avatar = this.avatars.get(avatar.id).avatar
          if (avatar.isDead && !_avatar.isDead) {
            _avatar.kill()
            if (avatar.id == this.channel.id) this.playerIsAlive = false
          } else if (!avatar.isDead) {
            _avatar.setX(avatar.x)
            _avatar.setY(avatar.y)
            _avatar.setData({playerAnimFrame: avatar.playerAnimFrame})
            _avatar.speed = avatar.speed
            _avatar.anims.play(_avatar.getData('playerAnimFrame'),true)
          }
        //}
      }
    })

    explosionState.forEach(explosionState => {
      const exists = this.explosions.has(explosionState.id)
      if (!exists) {
        const _explosion = new Explosion({scene: this, x: explosionState.x, y: explosionState.y, frame: explosionState.frame})
        this.explosions.set(explosionState.id, {
          explosion: _explosion
        })
      } 
    })

    //this.clientPrediction(movement)

    //this.serverReconciliation(movement)

    if (this.bombKey.isDown && !this.bombCoolDown && this.playerIsAlive) {
      this.bombCoolDown = true
      this.channel.emit('dropBomb')
      setTimeout(() => this.bombCoolDown = false, 250)
    }
  }
  
serverReconciliation = (movement) => {
  const { left, up, right, down } = movement
  const player = this.avatars.get(this.channel.id).avatar

  if (player) {
    // get the latest snapshot from the server
    const serverSnapshot = SI.vault.get()

    // get the closest player snapshot that matches the server snapshot time
    const playerSnapshot = playerVault.get(serverSnapshot.time, true)

    if (serverSnapshot && playerSnapshot) {
      // get the current player position on the server
      const serverPos = serverSnapshot.state.players.filter(s => s.id === this.channel.id)[0]
      
      // calculate the offset between server and client
      const offsetX = playerSnapshot.state[0].x - serverPos.x
      const offsetY = playerSnapshot.state[0].y - serverPos.y

      // check if the player is currently on the move
      const isMoving = left || up || right || down

      // we correct the position faster if the player moves
      const correction = isMoving ? 10 : 30

      // apply a step by step correction of the player's position
      player.x -= offsetX / correction
      player.y -= offsetY / correction
    }
  }
}

clientPrediction = (movement) => {
  const { left, up, right, down } = movement
  const player = this.avatars.get(this.channel.id).avatar
  const speed = player.speed

  if (player) {
    if (movement.left) player.setVelocityX(-speed)
    else if (movement.right) player.setVelocityX(speed)
    else player.setVelocityX(0)
    if (movement.up) player.setVelocityY(-speed)
    else if (movement.down) player.setVelocityY(speed)
    else player.setVelocityY(0)
    playerVault.add(
      SI.snapshot.create([{ id: this.channel.id, x: player.x, y: player.y }])
    ) 
  }
}
}
