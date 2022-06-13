export default class Powerup extends Phaser.Physics.Arcade.Sprite {
  constructor(data) {
    let { scene, x, y, powerupType, powerupID, isDestroyed } = data
    
    let frame = powerupType

    super(scene, x, y, frame)

    this.powerupID = powerupID
    this.powerupType = powerupType
    this.frame = powerupType
    this.isDestroyed = isDestroyed


    scene.add.existing(this)
    scene.physicsPowerups.add(this)
    this.body.setSize(60,60)
    this.setImmovable()
  }
  
  processPickupByAvatar(avatar) {
    console.log(this.powerupType)
    console.log(avatar.playerID)
    this.setDestroyed()
  }

  setDestroyed() {
    if (!this.isDestroyed) {
      this.isDestroyed = true
      this.scene.physicsPowerups.remove(this)
      this.setVisible(false)
    }
  }
}