export default class Powerup extends Phaser.Physics.Arcade.Sprite {
  constructor(data) {
    let { scene, x, y, powerupType, powerupID } = data
    
    let frame = powerupType

    super(scene, x, y, frame)

    this.powerupID = powerupID
    this.powerupType = powerupType
    this.frame = powerupType
    this.isBlownUp = false
    this.isDestroyed = false


    scene.add.existing(this)
    scene.physicsPowerups.add(this)
    this.body.setSize(60,60)
    this.setImmovable()
  }
  
  processPickupByAvatar(avatar) {
    this.setDestroyed()
    switch (String(this.powerupType)) {
      case 'bomb_normal':
        avatar.increaseMaxBombs()
        console.log('test')
        break
      case 'bomb_super':
        avatar.increaseMaxBombs(10)
        break
      case 'fire_normal':
        avatar.increaseBombRange()
        break
      case 'fire_super':
        avatar.increaseBombRange(10)
        break
      case 'skates':
        avatar.increaseSpeed()
        break
      case 'glove':
        avatar.giveGlove()
        break
      case 'kick':
        avatar.giveKick()
        break
      case 'skull':
        avatar.giveSkull()
        break
      default:
        console.log('not implemented yet: ' + String(this.powerupType))
    }
  }

  hitWithExplosion() {
    if (this.powerupType != 'skull') {
      this.isBlownUp = true
      this.setDestroyed()
    } else {
      // respawn a skull somewhere else
    }
  }

  setDestroyed() {
    if (!this.isDestroyed) {
      this.isDestroyed = true
      this.scene.physicsPowerups.remove(this)
      this.setVisible(false)
    }
  }
}