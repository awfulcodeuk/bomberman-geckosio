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
    this.avatarsToHit = new Map()
    this.blocksToHit = new Map()
    this.bombsToHit = new Map()
    // use this for triggering the explosion
    this.bombCountdown = this.scene.time.delayedCall(3000, this.explode, [], this)
  }

  hitWithExplosion() {
    this.bombCountdown.remove()
    this.explode()
  }

  explode() {
    if (this.isExploded === false) {
      this.isExploded = true
      this.scene.physicsBombs.remove(this)
      if (typeof(this.bombCountdown) != 'undefined') this.bombCountdown.destroy()
      
      let checkSpriteArr = []
      let explosionNorthBlockedAt = 100 
      let explosionEastBlockedAt = 100
      let explosionSouthBlockedAt = 100
      let explosionWestBlockedAt = 100
      let checkSpriteCentre = this.scene.add.sprite(this.x, this.y)
      this.scene.physics.add.existing(checkSpriteCentre)
      checkSpriteCentre.body.setSize(60,60)
      checkSpriteArr.push(checkSpriteCentre)
      this.scene.physics.add.overlap(checkSpriteCentre,this.scene.physicsBombs,function(explosionCollider,hitEntity) {
        this.bombsToHit.set(hitEntity.bombID, {
          hitEntity
        })
      }, false, this)
      for (let i = 1; i <= this.bombRange; i++) {
        // check north
        let checkSpriteNorth = this.scene.add.sprite(this.x, this.y - 64 * i)
        this.scene.physics.add.existing(checkSpriteNorth)
        checkSpriteNorth.body.setSize(60,60)
        checkSpriteArr.push(checkSpriteNorth)
        this.scene.physics.add.overlap(checkSpriteNorth,this.scene.physicsBombs,function(explosionCollider,hitEntity) {
          this.bombsToHit.set(hitEntity.bombID, {
            hitEntity
          })
        }, false, this)
        this.scene.physics.add.overlap(checkSpriteNorth,this.scene.physicsBlocks,function(explosionCollider,hitEntity) {
          this.blocksToHit.set(hitEntity.blockID, {
            hitEntity
          })
          // if we have hit a block the explosion is blocked from going further
          if (typeof hitEntity.blockType !== 'undefined') {
            explosionNorthBlockedAt = i
          }
        }, false, this)
      // check east
        let checkSpriteEast = this.scene.add.sprite(this.x + 64 * i, this.y)
        this.scene.physics.add.existing(checkSpriteEast)
        checkSpriteEast.body.setSize(60,60)
        checkSpriteArr.push(checkSpriteEast)
        this.scene.physics.add.overlap(checkSpriteEast,this.scene.physicsBombs,function(explosionCollider,hitEntity) {
          this.bombsToHit.set(hitEntity.bombID, {
            hitEntity
          })
        }, false, this)
        this.scene.physics.add.overlap(checkSpriteEast,this.scene.physicsBlocks,function(explosionCollider,hitEntity) {
          this.blocksToHit.set(hitEntity.blockID, {
            hitEntity
          })
          // if we have hit a block the explosion is blocked from going further
          if (typeof hitEntity.blockType !== 'undefined') {
            explosionEastBlockedAt = i
          }
        }, false, this)
        // check south
        let checkSpriteSouth = this.scene.add.sprite(this.x, this.y + 64 * i)
        this.scene.physics.add.existing(checkSpriteSouth)
        checkSpriteSouth.body.setSize(60,60)
        checkSpriteArr.push(checkSpriteSouth)
        this.scene.physics.add.overlap(checkSpriteSouth,this.scene.physicsBombs,function(explosionCollider,hitEntity) {
          this.bombsToHit.set(hitEntity.bombID, {
            hitEntity
          })
        }, false, this)
        this.scene.physics.add.overlap(checkSpriteSouth,this.scene.physicsBlocks,function(explosionCollider,hitEntity) {
          this.blocksToHit.set(hitEntity.blockID, {
            hitEntity
          })
          // if we have hit a block the explosion is blocked from going further
          if (typeof hitEntity.blockType !== 'undefined') {
            explosionSouthBlockedAt = i
          }
        }, false, this)
        // check west
        let checkSpriteWest = this.scene.add.sprite(this.x - 64 * i, this.y)
        this.scene.physics.add.existing(checkSpriteWest)
        checkSpriteWest.body.setSize(60,60)
        checkSpriteArr.push(checkSpriteWest)
        this.scene.physics.add.overlap(checkSpriteWest,this.scene.physicsBombs,function(explosionCollider,hitEntity) {
          this.bombsToHit.set(hitEntity.bombID, {
            hitEntity
          })
        }, false, this)
        this.scene.physics.add.overlap(checkSpriteWest,this.scene.physicsBlocks,function(explosionCollider,hitEntity) {
          this.blocksToHit.set(hitEntity.blockID, {
            hitEntity
          })
          // if we have hit a block the explosion is blocked from going further
          if (typeof hitEntity.blockType !== 'undefined') {
            explosionWestBlockedAt = i
          }
        }, false, this)
      }
      
      // explosion damage effect only lasts for 20 msec - then destroy all colliders and create explosion entities for the client
      this.scene.time.delayedCall(20, () => {
        console.log(this.blocksToHit)
        console.log(this.avatarsToHit)
        console.log(this.bombsToHit)
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
            const explosionEntity = {x: this.x - 64 * i, y: this.y, frame: _frame}
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