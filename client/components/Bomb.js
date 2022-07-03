export default class Bomb extends Phaser.Physics.Arcade.Sprite {
  constructor(data) {
    let { scene, x, y, frame } = data
    super(scene, x , y, frame)
    
    scene.add.existing(this)
    scene.physicsBombs.add(this)
    this.body.setSize(64, 64)
    this.body.setImmovable()
    this.scene = scene

    this.isDestroyed = false
    this.anims.play('bomb_regular_lit', true)
    
    const effectMusic = this.scene.sound.add('bomb_place')
    effectMusic.play()
  }
  
  setDestroyed() {
    if (!this.isDestroyed) {
      this.isDestroyed = true   
      this.setVisible(false)
      this.scene.physicsBombs.remove(this)
      this.destroy()
    }
  }
}