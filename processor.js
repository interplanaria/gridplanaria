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
      let info = await this.crawler.block.get("info")
      let current = await tape.current({ start: 1, end: info.blocks }, this.gene)
      let header = await this.cmd.BLOCK(current, info) // BLOCK
      if (header.nextblockhash) {
        await this.next();
      } else {
        this.listen()
      }
    } catch (e) {
      if (e.code === -8) { // -8: block height out of range
        this.listen()
      } else {
        console.log("error", e)
      }
    }
  }
  listen () {
    if (!this.m) {
      let o = Object.assign({chain: this.gene.chain}, this.gene.filter.host, this.gene.filter.peer)
      this.m = new bitwork(o)
      if(this.gene.filter && this.gene.filter.l && this.gene.filter.l.map) this.m.use("map", this.gene.filter.l.map)
      if(this.gene.filter && this.gene.filter.l && this.gene.filter.l.filter) this.m.use("filter", this.gene.filter.l.filter)
      this.m.use("parse", this.gene.defaultParser)
      this.m.on("ready", () => {
        this.m.on("mempool", async (e) => {
          await this.gene.onmempool({
            tx: e, network: this.crawler.mempool
          })
          await tape.write("MEMPOOL " + e.tx.h + " " + Date.now(), this.gene.tape + tapeFile)
        })
      })
    }
    if (!this.b) {
      let o = Object.assign({chain: this.gene.chain}, this.gene.filter.host, this.gene.filter.peer)
      this.b = new bitwork(o)
      if(this.gene.filter && this.gene.filter.l && this.gene.filter.l.map) this.b.use("map", this.gene.filter.l.map)
      if(this.gene.filter && this.gene.filter.l && this.gene.filter.l.filter) this.b.use("filter", this.gene.filter.l.filter)
      this.b.use("parse", this.gene.defaultParser)
      this.b.on("ready", () => {
        this.b.on("block", async (block) => {
          let info = await this.crawler.block.get("info")
          let current = await tape.current({ start: 1, end: info.blocks }, this.gene)
          await this.gene.onblock({
            header: block.header,
            tx: block.tx,
            tape: current.tape,
            network: this.crawler.block
          })
          await tape.write("BLOCK " + block.header.height + " " + block.header.hash + " " + block.header.prevHash + " " + Date.now(), this.gene.tape + tapeFile)
          await this.next();
        })
      })
    }
  }
}
module.exports = Processor
