export default class Powerup extends Phaser.Physics.Arcade.Sprite {
  constructor(data) {
    let { scene, x, y, powerupType, powerupID, isDestroyed } = data

    super(scene, x, y)

    this.powerupID = powerupID
    this.powerupType = powerupType
    this.isDestroyed = isDestroyed

    scene.add.existing(this)

    if (!this.isDestroyed) {
      this.scene.physicsPowerups.add(this)
      this.body.setSize(60,60)
      this.setImmovable()
      this.mainSprite = this.scene.add.sprite(this.x,this.y,'powerups', this.powerupType)
      this.borderSprite = this.scene.add.sprite(this.x,this.y)
      this.borderSprite.anims.play('powerups_border_flashing', true)
    } else {
      this.setVisible(false)
    }
  }
  
  setDestroyed() {
    if (!this.isDestroyed) {
      this.isDestroyed = true
      this.scene.physicsPowerups.remove(this)
      this.mainSprite.setVisible(false)
      this.borderSprite.setVisible(false)
    }
  }
}