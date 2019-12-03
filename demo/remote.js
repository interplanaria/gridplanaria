/*********************************************************************
*   
*   Raw Planaria
*   
*   1. Connects to a remote node
*   2. Processes all transactions
*   
*********************************************************************/
const Planaria = require('../index')
const planaria = new Planaria();
planaria.start({
  filter: {
    from: 611400,
    // The "host" attribute is a dummy value.
    // Switch it to YOUR OWN host IP
    host: { rpc: { user: "root", pass: "bitcoin", host: "166.98.14.89" } },
  },
  onmempool: async function(e) {
    console.log("onmempool = ", e.tx)
  },
  onblock: function(e) {
    console.log("onblock", e.header)
  },
  onstart: async function(e) {
    let netinfo = await e.network.get("rpc", "getNetworkInfo")
    console.log("onstart", netinfo)
  },
})
