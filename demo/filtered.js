/*********************************************************************
*   
*   Filtered Planaria
*   
*   Uses the "l.filter" to only process transactions that match
*   a certain pattern.
*   
*********************************************************************/
const Planaria = require('../index')
const planaria = new Planaria();
planaria.start({
  filter: {
    from: 611400,
    host: { 
      rpc: { user: "root", pass: "bitcoin" },
      parse: "txo"
    },
    l: {
      filter: (e) => {
        let matched = (
          e.out[0] && e.out[0].s1 === "19dbzMDDg4jZ4pvYzLb291nT8uCqDa61zH" ||
          e.out[0] && e.out[0].s2 === "19dbzMDDg4jZ4pvYzLb291nT8uCqDa61zH" ||
          e.out[1] && e.out[1].s1 === "19dbzMDDg4jZ4pvYzLb291nT8uCqDa61zH" ||
          e.out[1] && e.out[1].s2 === "19dbzMDDg4jZ4pvYzLb291nT8uCqDa61zH"
        )
        return matched
      }
    }
  },
  onmempool: async function(e) {
    console.log("E = ", e.tx)
  },
  onblock: function(e) {
    return new Promise((resolve, reject) => {
      let tx = e.tx(100)
      console.time("onblock " + e.header.height)
      let counter = 0;
      tx.on("data", (d) => {
        counter++;
      })
      .on("end", () => {
        console.timeEnd("onblock " + e.header.height)
        console.log("txs: ", counter)
        resolve()
      })
    })
  },
  onstart: function(e) {
    console.log("onstart", e)
  }
})
