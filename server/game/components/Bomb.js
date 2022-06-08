export default class Bomb extends Phaser.Physics.Arcade.Sprite {
  constructor(data) {
    let { scene, x, y, bombID } = data

    // align bombs to grid
    if (x % 64) x = Math.floor(x / 64) * 64 + 32
    if (y % 64) y = Math.floor(y / 64) * 64 + 32

    super(scene, x , y)
    this.scene = scene
    
    scene.add.existing(this)
    scene.physicsBombs.add(this)
    this.body.setSize(64, 64)
    this.body.setImmovable()

    this.bombID = bombID
    this.bombRange = 2
    this.isExploded = false
    this.lifetimeExplosionCount = this.scene.lifetimeExplosionCount
    // use this for triggering the explosion
    this.bombCountdown = this.scene.time.delayedCall(3000, this.explode, [], this)
  }

  explode() {
    if (this.isExploded === false) {
      this.isExploded = true
      this.scene.physicsBombs.remove(this)
      if (typeof(this.bombCountdown) != 'undefined') this.bombCountdown.destroy()
      
      let checkSpriteArr = []
      let explosionNorthBlockedAt = this.bombRange + 1
      let explosionEastBlockedAt = this.bombRange + 1
      let explosionSouthBlockedAt = this.bombRange + 1
      let explosionWestBlockedAt = this.bombRange + 1
      for (let i = 1; i <= this.bombRange; i++) {
        // check north
        if (explosionNorthBlockedAt > this.bombRange) {
          let checkSprite = this.scene.add.sprite(this.x, this.y - 64 * i)
          this.scene.physics.add.existing(checkSprite)
          checkSprite.body.setSize(60,60)
          checkSpriteArr.push(checkSprite)
          this.scene.physics.add.overlap(checkSprite,this.scene.physicsBlocks,function(explosionCollider,hitEntity) {
            hitEntity.hitWithExplosion()
            // if we have hit a block the explosion is blocked from going further
            if (typeof hitEntity.blockType !== 'undefined') {
              explosionNorthBlockedAt = i
            }
          })
        }
        // check east
        if (explosionEastBlockedAt > this.bombRange) {
          let checkSprite = this.scene.add.sprite(this.x + 64 * i, this.y)
          this.scene.physics.add.existing(checkSprite)
          checkSprite.body.setSize(60,60)
          checkSpriteArr.push(checkSprite)
          this.scene.physics.add.overlap(checkSprite,this.scene.physicsBlocks,function(explosionCollider,hitEntity) {
            hitEntity.hitWithExplosion()
            // if we have hit a block the explosion is blocked from going further
            if (typeof hitEntity.blockType !== 'undefined') {
              explosionEastBlockedAt = i
            }
          })
        }
        // check south
        if (explosionSouthBlockedAt > this.bombRange) {
          let checkSprite = this.scene.add.sprite(this.x, this.y + 64 * i)
          this.scene.physics.add.existing(checkSprite)
          checkSprite.body.setSize(60,60)
          checkSpriteArr.push(checkSprite)
          this.scene.physics.add.overlap(checkSprite,this.scene.physicsBlocks,function(explosionCollider,hitEntity) {
            hitEntity.hitWithExplosion()
            // if we have hit a block the explosion is blocked from going further
            if (typeof hitEntity.blockType !== 'undefined') {
              explosionSouthBlockedAt = i
            }
          })
        }
        // check west
        if (explosionWestBlockedAt > this.bombRange) {
          let checkSprite = this.scene.add.sprite(this.x - 64 * i, this.y)
          this.scene.physics.add.existing(checkSprite)
          checkSprite.body.setSize(60,60)
          checkSpriteArr.push(checkSprite)
          this.scene.physics.add.overlap(checkSprite,this.scene.physicsBlocks,function(explosionCollider,hitEntity) {
            hitEntity.hitWithExplosion()
            // if we have hit a block the explosion is blocked from going further
            if (typeof hitEntity.blockType !== 'undefined') {
              explosionWestBlockedAt = i
            }
          })
        }
      }
      
      // explosion damage effect only lasts for 20 msec - then destroy all colliders and create explosion entities for the client
      this.scene.time.delayedCall(20, () => {
        console.log('north: ' + explosionNorthBlockedAt)
        console.log('east: ' + explosionEastBlockedAt)
        console.log('south: ' + explosionSouthBlockedAt)
        console.log('west: ' + explosionWestBlockedAt)
        // centre explosion
        const explosionEntity = {x: this.x, y: this.y, frame: 'explosion_centre'}
        const explosionID = this.scene.lifetimeExplosionCount++
        this.scene.explosions.set(explosionID, {
          explosionID,
          explosionEntity
        })
        for (let i = 1; i <= this.bombRange; i++) {
          //north
          if (i < explosionNorthBlockedAt) {
            let _frame = 'explosion_north_end'
            if (i < this.bombRange ) _frame = 'explosion_north'
            const explosionEntity = {x: this.x, y: this.y - 64 * i, frame: _frame}
            const explosionID = this.scene.lifetimeExplosionCount++
            this.scene.explosions.set(explosionID, {
              explosionID,
              explosionEntity
            })
          }
          //east
          if (i < explosionEastBlockedAt) {
            let _frame = 'explosion_east_end'
            if (i < this.bombRange ) _frame = 'explosion_east'
            const explosionEntity = {x: this.x + 64 * i, y: this.y, frame: _frame}
            const explosionID = this.scene.lifetimeExplosionCount++
            this.scene.explosions.set(explosionID, {
              explosionID,
              explosionEntity
            })
          }
          //south
          if (i < explosionSouthBlockedAt) {
            let _frame = 'explosion_south_end'
            if (i < this.bombRange ) _frame = 'explosion_south'
            const explosionEntity = {x: this.x, y: this.y + 64 * i, frame: _frame}
            const explosionID = this.scene.lifetimeExplosionCount++
            this.scene.explosions.set(explosionID, {
              explosionID,
              explosionEntity
            })
          }
          //west
          if (i < explosionWestBlockedAt) {
            let _frame = 'explosion_west_end'
            if (i < this.bombRange ) _frame = 'explosion_west'
            const explosion = {x: this.x - 64 * i, y: this.y, frame: _frame}
            const explosionID = this.scene.lifetimeExplosionCount++
            this.scene.explosions.set(explosionID, {
              explosionID,
              explosionEntity
            })
          }
        }
        checkSpriteArr.forEach((checkSprite) => checkSprite.destroy())
        this.destroy()
      }, [], this)
    }
  }
  
}