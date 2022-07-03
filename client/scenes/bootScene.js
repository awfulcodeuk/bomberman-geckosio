import { Scene } from 'phaser'
import geckos from '@geckos.io/client'

export default class BootScene extends Scene {
  constructor() {
    super({ key: 'BootScene' })

    const channel = geckos({ port: 3001 })
    //const channel = geckos({port:null})

    channel.onConnect(error => {
      if (error) console.error(error.message)

      channel.on('ready', () => {
        this.scene.start('GameScene', { channel: channel })
      })
    })
  }
}
