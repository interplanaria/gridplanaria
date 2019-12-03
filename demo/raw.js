/*********************************************************************
*   
*   Raw Planaria
*   
*   Processes all transactions
*   
*********************************************************************/
const Planaria = require('../index')
const planaria = new Planaria();
planaria.start({
  filter: {
    from: 611400,
    host: { rpc: { user: "root", pass: "bitcoin" } },
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
