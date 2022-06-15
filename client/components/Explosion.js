export default class Explosion extends Phaser.GameObjects.Sprite {
  constructor(data) {
    let { scene, x, y, frame } = data
    
    super(scene, x, y, frame)
    
    scene.add.existing(this)
    this.setScale(1.4)

    const effectMusic = this.scene.sound.add('bomb_explode')
    effectMusic.play()

    this.anims.play(frame + '_anim', true)
    this.once('animationcomplete', () => {
      this.destroy()
    })
  }
}