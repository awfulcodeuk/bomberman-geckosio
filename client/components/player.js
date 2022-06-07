export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, playerID, x, y, frame) {
    super(scene, x, y, frame)
    
    this.playerID = playerID

    this.setOrigin(0.7,0.9)
        
    scene.add.existing(this)
    scene.physicsAvatars.add(this)

    this.body.setSize(50,50)
    this.body.setOffset(-3,14)
    this.body.setBounce(0)
    this.body.setCollideWorldBounds()

    
    this.processingDamage = false
  }

  hitWithExplosion() {
      this.processingDamage = true
      // only actually do anything if it's a "b" breakable block
  }
}
