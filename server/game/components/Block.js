export default class Block extends Phaser.Physics.Arcade.Sprite {
  constructor(data) {
    let { scene, x, y, frame, blockType, blockID, entityID, isDestroyed } = data

    super(scene, x, y)

    this.entityID = entityID

    this.blockType = blockType
    this.blockID = blockID
    this.isDestroyed = false

    scene.add.existing(this)
    scene.physicsBlocks.add(this)
    this.body.setSize(64,64)
    this.setImmovable()

  }
  
  hitWithExplosion() {
    // only actually do anything if it's a "b" breakable block
    if (this.blockType === 'b') {
      this.isDestroyed = true
      this.scene.time.delayedCall(1000, () => {
        this.scene.physicsBlocks.remove(this)
        this.scene.maybeSpawnPowerup(this.x,this.y)
      }, [], this)
      //console.log(this.blockID)
      //console.log(this.blockType)
      //console.log(this.x)
      //console.log(this.y)
    }
  }
}