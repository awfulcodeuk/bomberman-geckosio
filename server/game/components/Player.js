export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(data) {
    let { scene, x, y, playerID, entityID } = data

    super(scene, x, y, '')

    this.setOrigin(0.7,0.9)
        
    scene.add.existing(this)
    scene.physicsAvatars.add(this)
    this.body.setCircle(25)
    this.body.setOffset(-3,10)
    this.body.setBounce(0)
    this.body.setCollideWorldBounds()
    
    this.processingDamage = false

    this.scene = scene

    this.entityID = entityID
    this.bombRange = 2
    this.maxBombs = 1
    this.currentLaidBombs = 0

    this.speed = 90

    this.isDead = false

    this.playerID = playerID
    this.isConnected = true
    this.isVoting = false

    this.hasGlove = false
    this.hasKick = false
    
    this.move = {}
    this.animFrame = 'p' + this.playerID + '_stand'

    scene.events.on('update', this.update, this)
  }

  hitWithExplosion() {
    if (!this.processingDamage) {
      this.processingDamage = true
      this.kill()
    }
  }

  kill() {
    this.isDead = true
    this.scene.physicsAvatars.remove(this)
    this.setActive(false)
  }

  setMove(move) {
    if (!this.isDead) {
      this.move = move
    }
  }

  addCurrentLaidBomb() {
    this.currentLaidBombs++
  }

  removeCurrentLaidBomb() {
    this.currentLaidBombs--
  }

  setAnimFrame(playerAnimFrame) {
    this.animFrame = playerAnimFrame
  }

  increaseMaxBombs(amount = 1) {
    this.maxBombs = this.maxBombs + amount
    if (this.maxBombs > 10) this.maxBombs = 10
  }

  decreaseMaxBombs() {
    this.maxBombs--
    if (this.maxBombs < 1) this.maxBombs = 1
  }

  increaseBombRange(amount = 1) {
    this.bombRange = this.bombRange + amount
    if (this.bombRange > 10) this.bombRange = 10
  }

  decreaseBombRange() {
    this.bombRange--
    if (this.bombRange < 1) this.bombRange = 1
  }

  increaseSpeed() {
    this.speed = this.speed + 15
    if (this.speed > 160) this.speed = 180
  }

  decreaseSpeed() {
    this.speed = this.speed - 20
    if (this.speed < 40) this.speed = 40
  }

  giveGlove() {
    this.hasGlove = true
  }
  
  giveKick() {
    this.hasKick = true
  }

  giveSkull() {
    const skullRandomChoice = Math.random()
    if (skullRandomChoice < 0.33) {
      this.decreaseMaxBombs()
    } else if (skullRandomChoice < 0.66) {
      this.decreaseBombRange()
    } else {
      this.decreaseSpeed()
    }
  }
}
