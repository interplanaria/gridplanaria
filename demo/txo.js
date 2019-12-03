/*********************************************************************
*   
*   TXO Planaria
*   
*   Processes all transactions using TXO parser
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
  },
  onmempool: async function(e) {
    console.log("onmempool = ", e.tx)
  },
  onblock: function(e) {
    console.log("onblock", e.header)
  },
  onstart: function(e) {
    console.log("onstart")
  },
})
