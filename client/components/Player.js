export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, playerID, x, y, frame) {
    super(scene, x, y, frame)
    
    this.playerID = playerID
    this.isDead = false

    this.setOrigin(0.7,0.9)
        
    scene.add.existing(this)
    scene.physicsAvatars.add(this)

    this.body.setCircle(25)
    this.body.setOffset(-3,14)
    this.body.setBounce(0)
    this.body.setCollideWorldBounds()

    this.setDepth(1)

    this.bombRange = 2
    this.maxBombs = 1
    this.currentLaidBombs = 0
    
    this.processingDamage = false
  }

  kill() {
    this.isDead = true
    this.scene.physicsAvatars.remove(this)
    console.log("dead: " + this.playerID)
    this.anims.play('p1_die', true)
    this.once('animationcomplete', () => {
      this.destroy()
    })
  }

  setMaxBombs(newMaxBombs) {
    this.maxBombs = newMaxBombs
  }

  setBombPower(newBombPower) {
    this.bombPower = newBombPower
  }

  addCurrentLaidBomb() {
    this.currentLaidBombs++
  }

  clearCurrentLaidBomb() {
    this.currentLaidBombs--
  }

  hitWithExplosion() {
      this.processingDamage = true
      // only actually do anything if it's a "b" breakable block
  }
}
