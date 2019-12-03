const bitwork = require('bitwork')
const tape = require('./tape')
const tapeFile = "/tape.txt"
// Next command
class Processor {
  constructor (o) {
    this.gene = o.gene;
    this.crawler = o.crawler;
    this.cmd = o.cmd;
  }
  async next () {
    try {
      let info = await this.crawler.fetcher.get("info")
      let current = await tape.current({ start: 1, end: info.blocks }, this.gene)
      let header = await this.cmd.BLOCK(current, info) // BLOCK
      console.log("next blockhash: ", header.nextblockhash)
      if (header.nextblockhash) {
        await this.next();
      } else {
        console.log("Finished crawl mode. Enter listen mode...")
        this.listen()
      }
    } catch (e) {
      if (e.code === -8) { // -8: block height out of range
        console.log("Enter listen mode...")
        this.listen()
      } else {
        console.log("error", e)
      }
    }
  }
  listen () {
    this.crawler.listener.on("mempool", async (e) => {
      await this.gene.onmempool({
        tx: e, network: this.crawler.fetcher
      })
      await tape.write("MEMPOOL " + e.tx.h + " " + Date.now(), this.gene.tape + tapeFile)
    })
    this.crawler.listener.on("block", async (block) => {
      let info = await this.crawler.fetcher.get("info")
      let current = await tape.current({ start: 1, end: info.blocks }, this.gene)
      await this.gene.onblock({
        header: block.header,
        tx: block.tx,
        tape: current.tape,
        network: this.crawler.fetcher
      })
      await tape.write("BLOCK " + block.header.height + " " + block.header.hash + " " + block.header.prevHash + " " + Date.now(), this.gene.tape + tapeFile)
      await this.next();
    })
  }
}
module.exports = Processor
