export default class Block extends Phaser.Physics.Arcade.Sprite {
  constructor(data) {
    let { scene, x, y, frame, serverMode, blockType, blockID, isDestroyed } = data

    switch (blockType) {
      case "e":
        frame = 'edge_block'
        break
      case "s":
        frame = 'static_block'
        break
      default:
        // probably a "b"
        frame = 'breakable_block'
    }

    if (serverMode) {
      super(scene, x, y, '')
    } else {
      super(scene, x, y, frame)
    }

    this.blockType = blockType
    this.blockID = blockID
    this.isDestroyed = isDestroyed

    scene.add.existing(this)
    if (!this.isDestroyed) {
      scene.physicsBlocks.add(this)
      this.body.setSize(64,64)
      this.setImmovable()
    } else {
      this.setVisible(false)
    }
  }
  
  setDestroyed() {
    if (!this.isDestroyed) {
      this.isDestroyed = true
      this.anims.play('stage_01_block_destroying', true)
      this.once('animationcomplete', () => {
        this.setVisible(false)
      })
    }
  }
}