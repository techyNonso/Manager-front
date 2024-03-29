//const axios = require("axios");
const ourStore = require("../../src/js/store");
const ourStockModel = require("../../models/stockModel");
const modules = require("./modules");

// instantiate classes
const store = new ourStore();
const stockModel = new ourStockModel();

class Stock {
  constructor() {
    this.currentUser = store.getLoginDetail();
    this.setupDetails = store.getSetupDetail();
  }

  //upload
  uploadStockToRemote(stock, proceedToActivities) {
    //filter out stocks with remote =  false
    let filteredStock = modules.filterStock(stock);
    //upload these stocks
    if (filteredStock.length > 0) {
      let upload = modules.upload(filteredStock, store.getSetupDetail().detail);
    }
    //move on while the task runs asynchronously
    proceedToActivities();
  }

  //handle stocks
  async handleStock(proceedToActivities) {
    //get staff list
    const allStock = await stockModel.getStock();
    this.uploadStockToRemote(allStock, proceedToActivities);
  }
}

module.exports = Stock;
