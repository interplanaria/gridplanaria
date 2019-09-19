const tape = require('./tape')
const tapeFile = "/tape.txt"
class Command {
  constructor (o) {
    this.gene = o.gene;
    this.crawler = o.crawler;
    this.tapePath = this.gene.tape + tapeFile;
  }
  async START (current) {
    await this.gene.onstart({
      tape: current.tape,
      network: this.crawler.block
    })
//    await tape.write("START " + Date.now(), this.tapePath)
  }
  async REWIND (id) {
    let info = await this.crawler.block.get("info");
    await this.crawler.block.invalidate({ from: id })
    let [current, header] = await Promise.all([
      tape.current({ start: 1, end: info.blocks }, this.gene),
      this.crawler.block.get("header", { at: id })
    ])
    await this.gene.onrewind({
      header: header,
      info: info,
      tape: current.tape,
      network: this.crawler.block
    })
    await tape.write("REWIND " + header.height + " " + header.hash + " " + header.previousblockhash + " " + Date.now(), this.tapePath)
  }
  async BLOCK (current, info) {
    let header = await this.crawler.block.get("header", { at: current.head })
    let block = await this.crawler.block.get("block", current.head)
    await this.gene.onblock({
      header: header,
      tx: block.tx,
      tape: current.tape,
      network: this.crawler.block
    })
    await tape.write("BLOCK " + block.header.height + " " + block.header.hash + " " + block.header.prevHash + " " + Date.now(), this.tapePath)
    if (this.gene.chain && this.gene.chain.prune !== undefined) {
      this.crawler.block.prune()
    }
    return header;
  }
}
module.exports = Command;
