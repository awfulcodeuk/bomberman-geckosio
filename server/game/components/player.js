export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, playerId, x = 200, y = 200, dummy = false) {
    super(scene, x, y, '')

    this.setOrigin(0.7,0.9)
        
    scene.add.existing(this)
    scene.physicsAvatars.add(this)
    this.body.setSize(50,50)
    this.body.setOffset(-3,14)
    this.body.setBounce(0)
    this.body.setCollideWorldBounds()
    
    this.processingDamage = false

    this.scene = scene

    this.prevX = -1
    this.prevY = -1

    this.speed = 64

    this.dead = false
    this.prevDead = false

    this.playerId = playerId
    this.move = {}

    this.setDummy(dummy)

    this.body.setSize(32, 48)

    this.prevNoMovement = true

    this.setCollideWorldBounds(true)

    scene.events.on('update', this.update, this)
  }

  hitWithExplosion() {
    this.processingDamage = true
    // only actually do anything if it's a "b" breakable block

  }
  
  setDummy(dummy) {
    if (dummy) {
      this.body.setBounce(1)
      this.scene.time.addEvent({
        delay: Phaser.Math.RND.integerInRange(45, 90) * 1000,
        callback: () => this.kill()
      })
    } else {
      this.body.setBounce(0)
    }
  }

  kill() {
    this.dead = true
    this.setActive(false)
  }

  revive(playerId, dummy) {
    this.playerId = playerId
    this.dead = false
    this.setActive(true)
    this.setDummy(dummy)
    this.setVelocity(0)
  }

  setMove(data) {
    let int = parseInt(data, 36)

    let move = {
      left: int === 1 || int === 5,
      right: int === 2 || int === 6,
      up: int === 4 || int === 6 || int === 5,
      down: int === 8,
      none: int === 9
    }

    this.move = move
  }

  update() {
    if (this.move.left) this.setVelocityX(-this.speed)
    else if (this.move.right) this.setVelocityX(this.speed)
    else this.setVelocityX(0)

    if (this.move.up) this.setVelocityY(-this.speed)
    else if (this.move.down) this.setVelocityY(this.speed)
    else this.setVelocityY(0)
  }

  postUpdate() {
    this.prevX = this.x
    this.prevY = this.y
    this.prevDead = this.dead
  }
}
