export default class Powerup extends Phaser.Physics.Arcade.Sprite {
  constructor(data) {
    let { scene, x, y, powerupType, powerupID, isDestroyed } = data
    let frame = powerupType
    
    super(scene, x, y, frame)

    this.powerupID = powerupID
    this.powerupType = powerupType
    this.isDestroyed = isDestroyed

    scene.add.existing(this)

    if (!this.isDestroyed) {
      this.scene.physicsPowerups.add(this)
      this.body.setSize(60,60)
      this.setImmovable()
      this.mainSprite = this.scene.add.sprite(this.x,this.y,'powerups', this.powerupType)
      this.borderSprite = this.scene.add.sprite(this.x,this.y, 'powerups', 'powerups_border_1')
      this.borderSprite.anims.play('powerups_border_flashing',true)
    } else {
      this.setVisible(false)
    }
  }
  
  setDestroyed() {
    if (!this.isDestroyed) {
      this.isDestroyed = true
      this.setVisible(false)
    }
  }
}