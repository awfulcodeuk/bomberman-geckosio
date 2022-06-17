export default class Bomb extends Phaser.Physics.Arcade.Sprite {
  constructor(data) {
    let { scene, x, y, bombID, entityID, owningPlayer, isDestroyed } = data

    // align bombs to grid
    x = Math.floor(x / 64) * 64 + 32
    y = Math.floor(y / 64) * 64 + 32

    super(scene, x , y)
    this.scene = scene
    
    scene.add.existing(this)
    scene.physicsBombs.add(this)
    this.body.setSize(64, 64)
    this.body.setImmovable()

    this.entityID = entityID
    this.bombID = bombID
    this.owningPlayer = owningPlayer
    this.bombRange = this.owningPlayer.bombRange
    this.isDestroyed = isDestroyed
    this.lifetimeExplosionCount = this.scene.lifetimeExplosionCount
    this.entitiesToHit = new Map()
    this.avatarsToHit = new Map()
    this.blocksToHit = new Map()
    this.bombsToHit = new Map()
    // use this for triggering the explosion
    this.bombCountdown = this.scene.time.delayedCall(3500, this.explode, [], this)
    this.scene.physics.add.overlap(this,this.scene.physicsBombs,function(thisBomb,otherBomb) {
      // not sure why otherBomb is required - if use thisBomb it deletes the old one, not the new one
      if (typeof(this.isBombRealCountdown) != 'undefined') this.isBombRealCountdown.destroy()
      thisBomb.removeFromScene()
    }, false, this)
  }

  hitWithExplosion() {
    this.explode()
  }

  removeFromScene() {
    // used when the bomb shouldn't have been laid
    this.isDestroyed = true
    this.owningPlayer.removeCurrentLaidBomb()
    this.scene.physicsBombs.remove(this)
    if (typeof(this.bombCountdown) != 'undefined') this.bombCountdown.destroy()
    this.destroy()
  }

  explode() {
    if (this.isDestroyed === false) {
      this.isDestroyed = true
      this.owningPlayer.removeCurrentLaidBomb()
      this.scene.physicsBombs.remove(this)
      if (typeof(this.bombCountdown) != 'undefined') this.bombCountdown.destroy()

      //console.log('bombRange: ' + this.bombRange)
      //console.log('bombPosition: X: ' + this.x + ' Y: ' + this.y)
      const blastHorizontal = this.scene.add.sprite(this.x - this.bombRange * 64, this.y)
      this.scene.explosionColliders.add(blastHorizontal)
      // not sure why it needs 256 here - fix later
      let hx = 64 + (64 * this.bombRange * 4)
      let hy = 64
      blastHorizontal.body.setSize(hx , hy)
      //console.log('horizontal: start x: ' + (this.x - this.bombRange * 64) + ' hx: '+ hx + ' start y: ' + this.y + ' hy: ' + hy)
      
      const blastVertical = this.scene.add.sprite(this.x, this.y - this.bombRange * 64)
      this.scene.explosionColliders.add(blastVertical)
      // not sure why it needs 256 here - fix later
      let vx = 64
      let vy = 64 + (64 * this.bombRange * 4)
      blastVertical.body.setSize(vx, vy)
      //console.log('vertical: start x: ' + this.x + ' vx: '+ vx + ' start y: ' + (this.y - this.bombRange * 64) + ' vy: ' + vy)

      this.scene.physics.add.overlap(this.scene.explosionColliders,this.scene.physicsBlocks,function(explosionCollider,hitEntity) {
        const entityType = 'block'
        this.entitiesToHit.set(hitEntity.entityID, {
          hitEntity,
          entityType
        })
      }, false, this)
      this.scene.physics.add.overlap(this.scene.explosionColliders,this.scene.physicsBombs,function(explosionCollider,hitEntity) {
        const entityType = 'bomb'
        this.entitiesToHit.set(hitEntity.entityID, {
          hitEntity,
          entityType
        })
      }, false, this)
      this.scene.physics.add.overlap(this.scene.explosionColliders,this.scene.physicsAvatars,function(explosionCollider,hitEntity) {
        const entityType = 'avatar'
        this.entitiesToHit.set(hitEntity.entityID, {
          hitEntity,
          entityType
        })
      }, false, this)
      this.scene.physics.add.overlap(this.scene.explosionColliders,this.scene.physicsPowerups,function(explosionCollider,hitEntity) {
        const entityType = 'powerup'
        this.entitiesToHit.set(hitEntity.entityID, {
          hitEntity,
          entityType
        })
      }, false, this)

      let explosionNorthBlockedAt = 100 
      let explosionEastBlockedAt = 100
      let explosionSouthBlockedAt = 100
      let explosionWestBlockedAt = 100
      //console.log('N: ' + explosionNorthBlockedAt + ' E: ' + explosionEastBlockedAt + ' S: ' + explosionSouthBlockedAt + ' W: ' + explosionWestBlockedAt)
      // explosion damage effect only lasts for 20 msec - then destroy all colliders and create explosion entities for the client
      this.scene.time.delayedCall(20, () => {
        // establish if explosion is blocked by a block
        this.entitiesToHit.forEach((entity) => {
          if (entity.entityType === 'block') {
            const horizontalDifference = (entity.hitEntity.x - this.x) / 64
            const verticalDifference = (entity.hitEntity.y - this.y) / 64
            //console.log('x: ' + entity.hitEntity.x + ' y: ' + entity.hitEntity.y)
            //console.log('horizontal: ' + horizontalDifference + ' vert: ' + verticalDifference)
            if (horizontalDifference > 0) {
              if (horizontalDifference < explosionEastBlockedAt) explosionEastBlockedAt = horizontalDifference
            } else if (horizontalDifference < 0) {
              if (Math.abs(horizontalDifference) < explosionWestBlockedAt) explosionWestBlockedAt = Math.abs(horizontalDifference)
            }
            if (verticalDifference > 0) {
              if (verticalDifference < explosionSouthBlockedAt) explosionSouthBlockedAt = verticalDifference
            } else if (verticalDifference < 0) {
              if (Math.abs(verticalDifference) < explosionNorthBlockedAt) explosionNorthBlockedAt = Math.abs(verticalDifference)
            }
          }
        })
        //console.log('N: ' + explosionNorthBlockedAt + ' E: ' + explosionEastBlockedAt + ' S: ' + explosionSouthBlockedAt + ' W: ' + explosionWestBlockedAt)
        // hit entity if it is not beyond the blockage point
        
        this.entitiesToHit.forEach((entity) => {
          const horizontalDifference = Math.floor((entity.hitEntity.x - this.x) / 64)
          const verticalDifference = Math.floor((entity.hitEntity.y - this.y) / 64)
          //console.log('horizontal: ' + horizontalDifference + ' vert: ' + verticalDifference)
          let explosionBlocked = false
          if (horizontalDifference > 0) {
            if (horizontalDifference > explosionEastBlockedAt) explosionBlocked = true
          } else if (horizontalDifference < 0) {
            if (Math.abs(horizontalDifference) > explosionWestBlockedAt) explosionBlocked = true
          }
          if (verticalDifference > 0) {
            if (verticalDifference > explosionSouthBlockedAt) explosionBlocked = true
          } else if (verticalDifference < 0) {
            if (Math.abs(verticalDifference) > explosionNorthBlockedAt) explosionBlocked = true
          }
          if (!explosionBlocked) {
            //console.log(entity.hitEntity.x + ' ' + entity.hitEntity.y)
            entity.hitEntity.hitWithExplosion()
          }
        })

        // create explosions to send to client for display
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
        blastHorizontal.destroy()
        blastVertical.destroy()
        this.destroy()
      }, [], this)
    }
  }
}