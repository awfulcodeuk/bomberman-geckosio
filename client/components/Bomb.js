
import Explosion from '../entities/Explosion.js'

export default class Bomb extends Phaser.Physics.Arcade.Sprite {
  constructor(data) {
    let { scene, x, y, frame, isExploding} = data

    super(scene, x , y, frame)
    
    scene.add.existing(this)
    scene.physicsBombs.add(this)
    this.body.setSize(64, 64)
    this.body.setImmovable()

    this.bombRange = 2

    this.isExploding = false || isExploding
  }
  
}