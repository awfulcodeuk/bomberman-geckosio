export default class Explosion extends Phaser.GameObjects.Sprite {
  constructor(data) {
    let { scene, x, y, frame } = data
    
    super(scene, x, y, frame)
    
    scene.add.existing(this)
    this.setScale(1.4)

    this.anims.play(frame + '_anim', true)
    this.once('animationcomplete', () => {
      this.destroy()
    })
  }
}