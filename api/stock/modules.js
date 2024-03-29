const axiosInstance = require("../axiosInstance");
const ourModel = require("../../models/stockModel");
const stockModel = new ourModel();
const { Notyf } = require("notyf");
const filterStock = stock => {
  let match = stock.filter(product => {
    return product.remote == false;
  });

  return match;
};

const upload = async (stock, setup) => {
  // add company and branch ID manually
  let company = setup.companyId;
  let branch = setup.branchId;
  let promises = [];
  for (let i = 0; i < stock.length; i++) {
    promises.push(
      axiosInstance.post(`stock/company=${company}/branch=${branch}/`, {
        productName: stock[i].name,
        productId: stock[i].productId,
        quantity: stock[i].qty,
        batchId: stock[i].batchId,
        expiryDate: stock[i].expDate,
        unit: stock[i].unit,
        ppmu: stock[i].pricePerMinUnit,
        price: stock[i].price,
        companyId: company,
        branchId: branch
      })
      //.then(response => {
      //console.log(response);
      //})
    );
  }

  Promise.all(promises)
    .then(async () => {
      await stockModel.remoteUpdateAllProduct(stock);
    })
    // eslint-disable-next-line no-unused-vars
    .catch(error => {
      //handle error
      const notyf = new Notyf({
        duration: 3000
      });

      // Display an error notification
      notyf.error("An Error Occured");
      //remove disabled and also loading sign
      document.querySelector("#syncBtn").disabled = false;
      document.getElementById("sync").style.display = "none";
      //set sync store
      store.setSyncState(false);
    });
};

module.exports = { filterStock, upload };
