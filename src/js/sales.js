/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

//const salesModel = require("../../models/salesModel");

//global variables
var cart = [];

//global variable
var stock;
var sales;

var invoiceTemplate =
  '<h4 class="text-center" id="companyStaticName"></h4>' +
  '<div class="text-center mt-2" id="companyStaticAddress"></div>' +
  '<div class="text-center mt-2" id="companyStaticNumber"></div>' +
  '<h5 class="text-center mt-2" id="transTypeStatic"></h5>' +
  "<div>" +
  '  <table class="table table-borderless table-sm mt-3">' +
  "   <tr>" +
  "     <td>" +
  "       <strong>Invoice Id:</strong>" +
  "    </td>" +
  '    <td id="invoiceId"></td>' +
  "  </tr>" +
  "  <tr>" +
  "  <td>" +
  "    <strong>Date:</strong>" +
  "  </td>" +
  '  <td id="date"></td>' +
  " </tr>" +
  "</table>" +
  "</div>" +
  '<div class="border border-dark"></div>' +
  "<div>" +
  ' <table class="table  table-borderless table-sm mt-3">' +
  "<thead" +
  ' class="border border-dark border-top-0 border-left-0 border-right-0"' +
  ">" +
  "  <tr>" +
  "   <th>" +
  "    ITEM" +
  "   </th>" +
  "<th>" +
  "    QTY" +
  "  </th>" +
  "  <th>" +
  "    Price" +
  "  </th>" +
  " </tr>" +
  " </thead>" +
  " <tbody" +
  ' class="border border-dark border-top-0 border-left-0 border-right-0"' +
  ' id="purchase"' +
  "  ></tbody>" +
  '<tfoot class="pt-3">' +
  " <tr>" +
  "   <th>Sub Total</th>" +
  "   <td></td>" +
  '  <td><strong id="total"></strong></td>' +
  " </tr>" +
  " <tr>" +
  "  <th>Disccount</th>" +
  "  <td></td>" +
  '  <td id="disccountStatic"></td>' +
  "</tr>" +
  " <tr>" +
  "   <th>Net Price</th>" +
  "   <td></td>" +
  '  <td id="netPriceStatic"></td>' +
  " </tr>" +
  " <tr>" +
  "   <th>Amount Paid</th>" +
  "   <td></td>" +
  '   <td id="amtPaid"></td>' +
  " </tr>" +
  " <tr>" +
  "  <th>Balance</th>" +
  "  <td></td>" +
  '  <td id="balance">0</td>' +
  " </tr>" +
  "</tfoot>" +
  " </table>" +
  "<div" +
  '  class=" text-center pt-3 pb-3"' +
  ">" +
  '<canvas id="barcode"></canvas>' +
  "</div>" +
  "<div" +
  '  class="border border-right-0 border-left-0 text-center pt-3 pb-3"' +
  ">" +
  "  <strong>THANK YOU</strong>" +
  "</div>" +
  "</div>";

const hideWarning = () => {
  document.getElementById("hide").classList.add("hide");
};

//calculation for net price
const calculateNetPrice = () => {
  let disccount = document.getElementById("disccount").value;
  let totalPrice = document.getElementById("totalPrice").textContent;

  //calculate
  if (disccount > 0) {
    let value = Number(totalPrice - (disccount / 100) * totalPrice);
    document.getElementById("netPrice").textContent = formatMoney(
      Math.ceil(value)
    );
  } else {
    document.getElementById("netPrice").textContent = formatMoney(totalPrice);
  }
};

//calculate total
const calculateTotal = cart => {
  let [totalPrice, totalQty] = salesModel.calculateTotal(cart);
  document.getElementById("totalQty").textContent = totalQty;
  document.getElementById("totalPrice").textContent = totalPrice;

  //calculate net price
  calculateNetPrice();
};

//load cart
const loadCart = async () => {
  stock = await stockModel.getStock();

  let record;
  //get products in store
  if (store.getSaleStore() != undefined) {
    record = store.getSaleStore().record
      ? store.getSaleStore().record
      : store.getSaleStore();
  } else {
    record = [];
  }

  //get last list
  if (record != undefined && record.length > 0) {
    cart = record;

    updateCart(cart);

    //calculate total quantity
    calculateTotal(cart);
  }
};

//table reseter
const emptyTable = () => {
  document.getElementById("totalPrice").textContent = "-";
  document.getElementById("totalQty").textContent = "-";
  document.getElementById("disccount").value = "0";
  document.getElementById("netPrice").textContent = "-";
  document.getElementById("transType").selectedIndex = 0;
  document.getElementById("customerForm").reset();
  let box = document.getElementById("transBox");
  if (!box.classList.contains("hide")) {
    box.classList.add("hide");
  }
};

const showWarning = message => {
  let box = document.getElementById("hide");
  box.classList.remove("hide");
  box.textContent = message;
};

//add to cart
const addToCart = (cart, prodId, qty, unit) => {
  //check if product is in cart
  if (salesModel.checkCart(cart, prodId)) {
    cart = salesModel.updateCartValue(cart, prodId, qty, unit);
    //set store
    store.setSaleStore(cart);
    updateCart(cart);
    //calculate total quantity
    calculateTotal(cart);
  } else {
    //get product object
    let newProduct = salesModel.getProduct(stock, prodId, qty, unit);

    cart.push(newProduct);
    //set store
    store.setSaleStore(cart);
    //update cart
    updateCart(cart);

    //calculate total quantity
    calculateTotal(cart);
  }

  setTimeout(() => {
    document.getElementById("saleForm").reset();
    document.getElementById("prodName").focus();
  });
};

//check if in cart
const addCart = (cart, prodId, qty) => {
  qty += Number(salesModel.getMatchInCart(cart, prodId));

  return qty;
};

//add up matching stock
const addUpMatch = (stock, id) => {
  let matchQty = salesModel.addUpMatch(stock, id);
  return matchQty;
};

//suggest product
const suggestProduct = e => {
  let word = e.target.value.trim();
  let match = salesModel.getMatchingProduct(stock, word);
  let sorted = stockModel.sortStock(match);
  if (sorted) {
    displaySuggestions(sorted);
  }
};

//append suggestion
const appendSuggestion = (e, name) => {
  document.getElementById("prodName").value = name;
  //hide suggestions
  document.getElementById("suggestionItems").innerHTML = "";
};

//process sale
const processSale = e => {
  e.preventDefault();

  //hide hideWarning
  let warn = document.getElementById("hide");
  if (!warn.classList.contains("hide")) {
    warn.classList.add("hide");
  }
  let qty = 0;
  let prodId = document.getElementById("prodName");
  qty = Number(document.getElementById("qty").value);

  let unit = Number(salesModel.getUnit(stock, prodId.value.trim()));

  //if no quantity is provided
  if (qty < 1) {
    //get the product unit

    qty += unit;
  }
  //check if product is in cart and add it and return the new qty
  qty = addCart(cart, prodId.value.trim(), qty);

  //adding up quantity of matching products
  let matchQty = addUpMatch(stock, prodId.value.trim());

  let input = [prodId];

  if (salesModel.isEmpty(input)) {
    showWarning("Please enter a product id or Product name");
  } else if (!salesModel.productExists(stock, prodId)) {
    showWarning("No match found !!!");
  } else if (qty > matchQty) {
    showWarning("Quantity entered is not available or stock is exhausted !!!");
  } else {
    //updateCart
    addToCart(cart, prodId.value.trim(), qty, unit);
    //empty suggestions
    document.getElementById("suggestionItems").innerHTML = "";
  }
};

const addUpQty = (e, unit) => {
  prodId = e.target.dataset.id;
  let qty = Number(e.target.value);

  //adding up quantity of matching products
  let matchQty = addUpMatch(stock, prodId);

  if (qty > matchQty) {
    showWarning("Quantity entered is not available or stock is exhausted !!!");
    //set it back to 1 or unit quantity
    e.target.value = unit;
  } else if (qty == 0) {
    //set it back to 1 or unit quantity
    e.target.value = unit;
  } else {
    cart = salesModel.updateCartValue(cart, prodId, qty, unit);
    //set store
    store.setSaleStore(cart);
    //update cart
    updateCart(cart);
    e.target.focus();
    //calculate total quantity
    calculateTotal(cart);
  }
};

//delete
const deleteMatch = prodId => {
  cart = salesModel.deleteSale(cart, prodId);

  //store current cart detail
  store.setSaleStore(cart);
  updateCart(cart);
  if (cart.length > 0) {
    //calculate total quantity
    calculateTotal(cart);
  } else {
    //empty table static part
    emptyTable();
  }
};

//delete a sale from cart
const cancelCurSale = e => {
  let prodId = e.target.dataset.id;
  //get window object
  const window = BrowserWindow.getFocusedWindow();
  //show dialog
  let resp = dialog.showMessageBox(window, {
    title: "Manager-front",
    buttons: ["Yes", "Cancel"],
    type: "info",
    message: "Click Ok to delete item from list"
  });

  //check if response is yes
  resp.then((response, checkboxChecked) => {
    if (response.response == 0) {
      showLoading();
      deleteMatch(prodId);
      hideLoading();
    }
  });
};

//handle transaction type
const handleTransType = e => {
  let transType = e.target.value;
  let transBox = document.getElementById("transBox");
  let myForm = document.getElementById("customerForm");
  if (transType == "credit") {
    if (transBox.classList.contains("hide")) {
      transBox.classList.remove("hide");
    }
  } else {
    if (!transBox.classList.contains("hide")) {
      transBox.classList.add("hide");
      myForm.reset();
    }
  }
};

const sub = (obj, qty, cp, sp) => {
  //if stock is more than purchase quantity
  if (Number(obj.qty) > Number(qty)) {
    cp += Number(obj.pricePerMinUnit) * Number(qty);

    sp += Number(obj.price) * Number(qty);
    //subtract purchase
    obj.qty = Number(obj.qty) - Number(qty);
    //purchase  = 0
    qty = 0;

    //return new values
    return [obj, qty, cp, sp];
    //if purchase is more than stock
  } else if (Number(obj.qty) < Number(qty)) {
    //did that batch contribute ?
    if (Number(obj.qty) > 0) {
      cp += Number(obj.pricePerMinUnit) * Number(obj.qty);
      sp += Number(obj.price) * Number(obj.qty);
    }
    //subtract stock from purchase
    qty = Number(qty) - Number(obj.qty);
    //stock = 0
    obj.qty = 0;

    //return new values
    return [obj, qty, cp, sp];
    //if stock == purchase
  } else {
    //did that batch contribute ?
    if (Number(obj.qty) > 0) {
      cp += Number(obj.pricePerMinUnit) * Number(qty);
      sp += Number(obj.price) * Number(qty);
    }
    //purchase = 0
    obj.qty = 0;
    //stock == 0
    qty = 0;

    //return new values
    return [obj, qty, cp, sp];
  }
};

const loadInvoiceStaticSection = (
  invoiceId,
  deposit,
  transType,
  disccount,
  netPrice,
  totalPrice,
  amtPaid,
  balance
) => {
  let date = new Date();
  let { detail } = store.getSetupDetail();
  document.getElementById("companyStaticName").textContent = detail.companyName;
  document.getElementById("companyStaticAddress").textContent =
    detail.branchAddress;
  document.getElementById("companyStaticNumber").textContent =
    detail.branchPhone;
  document.getElementById("transTypeStatic").textContent =
    transType.toUpperCase() + " TRANSACTION";
  document.getElementById("invoiceId").textContent = invoiceId;
  document.getElementById("total").textContent = "₦ " + formatMoney(totalPrice);
  document.getElementById("disccountStatic").textContent = disccount + "%";
  document.getElementById("netPriceStatic").textContent = "₦ " + netPrice;
  document.getElementById("amtPaid").textContent =
    "₦ " + formatMoney(amtPaid.split(",").join(""));
  document.getElementById("balance").textContent = "₦ " + formatMoney(balance);
  document.getElementById("date").textContent =
    date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();

  JsBarcode("#barcode", `${invoiceId}`, {
    width: 2,
    height: 40
  });
};

//invoice id genration
const generateInvoiceId = () => {
  let csNum = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  let val = "";
  for (let i = 0; i < 5; i++) {
    let num;
    num = Math.floor(Math.random() * 10);
    val += csNum[num];
    val += Math.floor(Math.random() * 10);
  }
  return val;
};

const execInvoice = async (
  invoiceId,
  customerAddress,
  customerName,
  customerNumber,
  deposit,
  transType,
  disccount,
  netPrice,
  totalPrice,
  amtPaid,
  balance,
  cartCp,
  cartSp
) => {
  //insert details into invoice
  await salesModel.insertInvoice(
    invoiceId,
    customerAddress,
    customerName,
    customerNumber,
    deposit,
    transType,
    disccount,
    netPrice,
    totalPrice,
    amtPaid,
    balance,
    cartCp,
    cartSp
  );

  //display and print invoice
  if (showStaticModal(invoiceTemplate)) {
    //load purchase to invoice
    //console.log(cart);
    displayPurchase(cart);
    //enter static part of invoice
    loadInvoiceStaticSection(
      invoiceId,
      deposit,
      transType,
      disccount,
      netPrice,
      totalPrice,
      amtPaid,
      balance
    );

    print();

    //clean up
    cart = [];

    document.getElementById("prodName").focus();
  }
};

//insert sale into db
const insertSale = async (cart, cp, sp) => {
  //get some necessary details
  let amtPaid;
  let balance = 0;
  let customerName = document.getElementById("customerName").value;
  let customerAddress = document.getElementById("customerAddress").value;
  let customerNumber = document.getElementById("customerNumber").value;
  let deposit = document.getElementById("deposit").value;
  let transType = document.getElementById("transType").value;
  let disccount = document.getElementById("disccount").value;
  let netPrice = document.getElementById("netPrice").textContent;
  let totalPrice = document.getElementById("totalPrice").textContent;
  netPrice = netPrice.split(",").join("");
  if ((deposit == 0 || deposit == "") && transType != "credit") {
    amtPaid = netPrice;
    balance = 0;
  } else {
    amtPaid = deposit;
    balance = Number(netPrice.split(",").join("")) - Number(deposit);
  }

  //get invoice details
  let invoiceId = generateInvoiceId();
  //loop through the cart and insert details to sales db
  for (let i = 0; i < cart.length; i++) {
    let product = cart[i];

    //insert details
    await salesModel.insertSales(product, invoiceId, transType, disccount);
  }

  //insert details into invoice db
  execInvoice(
    invoiceId,
    customerAddress,
    customerName,
    customerNumber,
    deposit,
    transType,
    disccount,
    netPrice,
    totalPrice,
    amtPaid,
    balance,
    cp,
    sp
  );

  //clear cart table
  updateCart([]);
  //clear static part of cart table
  emptyTable();
  //empty cart from store
  store.setSaleStore([]);
  //reload add sales page
  loadAddSales();
};

//subtract qty from stock and update stock table
const execute = async (match, qty) => {
  //reverse the array
  //match = match.reverse();
  //loop through the match
  let totalProductCp = 0;
  let totalProductSp = 0;

  for (let i = 0; i < match.length; i++) {
    let obj = match[i];

    if (qty > 0) {
      let [newProd, newQty, cp, sp] = sub(
        obj,
        qty,
        totalProductCp,
        totalProductSp
      );
      totalProductCp = cp;
      totalProductSp = sp;

      qty = newQty;
    }
  }

  //update all matches
  for (let i = 0; i < match.length; i++) {
    let product = match[i];
    await salesModel.updateStock(product);
  }

  return [totalProductCp, totalProductSp];
};

//continue process
const process = async cart => {
  let match;
  let newValue;
  let cartCp = 0;
  let cartSp = 0;
  //loop through cart
  for (let i = 0; i < cart.length; i++) {
    let product = cart[i];
    //get matching product from db
    match = salesModel.getMatch(stock, product.productId);

    //get quantity bought
    let qty = product.qty;

    //handle each match
    let [totalProductCp, totalProductSp] = await execute(match, qty);

    //assign this cp and sp to this product in cart
    cart[i].cp = totalProductCp;
    cart[i].sp = totalProductSp;
    //add up this total cp and sp to total cart cp and sp
    cartCp += totalProductCp;
    cartSp += totalProductSp;
  }

  //insert into sales
  insertSale(cart, cartCp, cartSp);
};

//process cart
const processCart = e => {
  //check if cart is empty
  if (cart.length > 0) {
    let totalPrice = document.getElementById("totalPrice");
    let totalQty = document.getElementById("totalQty");
    let disccount = document.getElementById("disccount").value;
    let netPrice = document.getElementById("netPrice");
    let transType = document.getElementById("transType").value;
    let name = document.getElementById("customerName");
    let number = document.getElementById("customerNumber");
    let address = document.getElementById("customerAddress");
    let deposit = document.getElementById("deposit");

    let inputs = [name, number, address, deposit];
    let numNet = netPrice.textContent.replace(/[^\d.-]/g, "");
    numNet = Number(numNet).toFixed(0);

    if (transType == "") {
      showModal("Please enter a transaction type.");
    } else if (transType == "credit" && salesModel.isEmpty(inputs)) {
      showModal("Please fill all fields");
    } else if (
      transType == "credit" &&
      salesModel.isNotAlpha(name.value.trim())
    ) {
      showModal("Please enter a valid name.");
    } else if (
      transType == "credit" &&
      salesModel.isNotPhoneNumber(number.value.trim())
    ) {
      showModal("Please enter a valid phone number.");
    } else if (transType == "credit" && deposit.value == Number(numNet)) {
      showModal(
        "Amount deposited matches that of cash sales and not credit sales"
      );
    } else if (transType == "credit" && deposit.value > Number(numNet)) {
      showModal("Amount deposited is more than net price");
    } else {
      //get window object
      const window = BrowserWindow.getFocusedWindow();
      //show dialog
      let resp = dialog.showMessageBox(window, {
        title: "Manager-front",
        buttons: ["Yes", "Cancel"],
        type: "info",
        message: "Are you sure all purchase have been recorded"
      });

      //check if response is yes
      resp.then((response, checkboxChecked) => {
        if (response.response == 0) {
          //process
          process(cart, totalQty);
        }
      });
    }
  } else {
    showModal("please record a purchase first");
  }
};

//cancel all sales in rocess
const cancelAllSales = e => {
  if (cart.length == 0) return;
  //get window object
  const window = BrowserWindow.getFocusedWindow();
  //show dialog
  let resp = dialog.showMessageBox(window, {
    title: "Manager-front",
    buttons: ["Yes", "Cancel"],
    type: "info",
    message: "Click Ok to delete all items in cart"
  });

  //check if response is yes
  resp.then((response, checkboxChecked) => {
    if (response.response == 0) {
      showLoading();
      //cleanup
      cart = [];
      store.setSaleStore(cart);
      updateCart(cart);
      emptyTable();
      hideLoading();
    }
  });
};

//sales listing js starts

//add up total
const addUpDispSalesMoney = match => {
  let total = salesModel.getTotalSales(match);
  document.getElementById("totalSales").textContent = formatMoney(total);
};

//get total sales on display
const addUpOtherDispSalesMoney = (match, saleType) => {
  let total = salesModel.getOtherTotalSales(match, saleType);
  document.getElementById("totalSales").textContent = formatMoney(total);
};

//get total cash sales on display.
const addUpDispCashSales = match => {
  //get cash sales
  let cashSales = salesModel.getCashSales(match);
  if (cashSales == false) {
    document.getElementById("totalCashSales").textContent = 0;
  } else {
    let total = 0;
    //loop through cash sales
    cashSales.forEach(sale => {
      total += Number(sale.price);
    });
    document.getElementById("totalCashSales").textContent = formatMoney(total);
  }
};

//get total online sales on display
const addUpDispCreditSales = match => {
  //get credit sales
  let creditSales = salesModel.getCreditSales(match);
  if (creditSales == false) {
    document.getElementById("totalCreditSales").textContent = 0;
  } else {
    let total = 0;
    //loop through cash sales
    creditSales.forEach(sale => {
      total += Number(sale.price);
    });
    document.getElementById("totalCreditSales").textContent = formatMoney(
      total
    );
  }
};

//get total online sales on display.
const addUpDispOnlineSales = match => {
  //get cash sales
  let onlineSales = salesModel.getOnlineSales(match);
  if (onlineSales == false) {
    document.getElementById("totalOnlineSales").textContent = 0;
  } else {
    let total = 0;
    //loop through cash sales
    onlineSales.forEach(sale => {
      total += Number(sale.price);
    });
    document.getElementById("totalOnlineSales").textContent = formatMoney(
      total
    );
  }
};

//get average disccount
const getAverageDisccount = match => {
  let averageDisccount = salesModel.getAvgDisccount(match);
  //document.getElementById("avgDisccount").textContent = averageDisccount;
};

//get average disccount for other sale types
const getOtherAverageDisccount = (match, saleType) => {
  let averageDisccount = salesModel.getOtherAvgDisccount(match, saleType);

  //document.getElementById("avgDisccount").textContent = averageDisccount;
};

//get Balance
const getBalance = match => {
  let total = salesModel.getTotalSales(match);
  let avgDis = salesModel.getAvgDisccount(match);
  //let balance = total; //- (avgDis * total) / 100;
  //document.getElementById("balance").textContent = formatMoney(balance);
};

//get other balance
const getOtherBalance = (match, saleType) => {
  let total = salesModel.getOtherTotalSales(match, saleType);
  let avgDis = salesModel.getOtherAvgDisccount(match, saleType);
  // let balance = total - (avgDis * total) / 100;
  //document.getElementById("balance").textContent = formatMoney(balance);
};

//mark all empty summary box
const allSummaryHandle = saleType => {
  document.getElementById("totalSales").textContent = "-";
  if (saleType == "all") {
    document.getElementById("totalCashSales").textContent = "-";
    document.getElementById("totalOnlineSales").textContent = "-";
    document.getElementById("totalCreditSales").textContent = "-";
  }
  //document.getElementById("avgDisccount").textContent = "-";
  //document.getElementById("balance").textContent = "-";
};

//get sales matching the date provided
const getSales = (day, month, year) => {
  //get sales if sales ahve been defined
  let match = salesModel.getMatchSales(sales, day, month, year);
  //display sales date
  document.getElementById("dispDate").textContent =
    day + "-" + month + "-" + year;
  if (match != false) {
    displayMatchSales(match);
    //get total sales on display
    addUpDispSalesMoney(match);

    //get total cash sales on display
    addUpDispCashSales(match);

    //get total online sales on display
    addUpDispOnlineSales(match);

    //get total online sales on display
    addUpDispCreditSales(match);

    //get average disccount
    getAverageDisccount(match);

    //get balance
    getBalance(match);
  } else {
    document.getElementById("salesList").innerHTML =
      " <tr>" +
      ' <td colspan="5" class="text-center">' +
      "  <span>No sales found</span>" +
      " </td>" +
      " </tr>";

    allSummaryHandle("all");
  }
};

//get sales for the mathching date and sale type
const getOtherSales = (day, month, year, saleType) => {
  //get sales if sales have been defined
  let match = salesModel.getOtherMatchSales(sales, day, month, year, saleType);

  //display sales Date
  document.getElementById("dispDate").textContent =
    day + "-" + month + "-" + year;
  if (match != false) {
    if (saleType == "cash") {
      displayMatchCashSales(match);
    } else if (saleType == "online") {
      displayMatchOnlineSales(match);
    } else if (saleType == "credit") {
      displayMatchCreditSales(match);
    }

    //get total sales on display
    addUpOtherDispSalesMoney(match, saleType);

    //get average disccount
    getOtherAverageDisccount(match, saleType);

    //get balance
    getOtherBalance(match, saleType);
  } else {
    document.getElementById("salesList").innerHTML =
      " <tr>" +
      ' <td colspan="5" class="text-center">' +
      "  <span>No sales found</span>" +
      " </td>" +
      " </tr>";

    allSummaryHandle(saleType);
  }
};

//load current sales page
const loadCurrentSales = async () => {
  showLoading();
  let date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  //get sales
  sales = await salesModel.getSales();

  //get sales for the matching date
  getSales(day, month, year);

  //enable button
  document.getElementById("processBtn").disabled = false;
  hideLoading();

  document.getElementById("saleDay").value = day;
  document.getElementById("saleMonth").value = month;
  document.getElementById("saleYear").value = year;
};

//load sales for online credit and cash transactions
const loadOtherSales = async saleType => {
  showLoading();
  let date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  document.getElementById("otherSaleDay").value = day;
  document.getElementById("otherSaleMonth").value = month;
  document.getElementById("otherSaleYear").value = year;
  //get sales
  sales = await salesModel.getSales();

  //get sales for the matching date
  getOtherSales(day, month, year, saleType);

  hideLoading();
  //enable button
  document.getElementById("processBtn").disabled = false;

  //enable button
  //document.getElementById("processBtn").disabled = false;
};

//load sales on button click
const loadSales = e => {
  showLoading();
  e.preventDefault();

  document.getElementById("salesList").innerHTML =
    "<tr>" +
    '<td colspan="5" class="text-center" >' +
    '<div class="spinner-grow text-success"></div>' +
    "</td>" +
    "</tr>";
  let day = document.getElementById("saleDay").value;
  let month = document.getElementById("saleMonth").value;
  let year = document.getElementById("saleYear").value;

  getSales(day, month, year);
  hideLoading();
};

//load other sales
const loadOtherSelectedSales = (e, saleType) => {
  showLoading();
  e.preventDefault();

  document.getElementById("salesList").innerHTML =
    "<tr>" +
    '<td colspan="5" class="text-center" >' +
    '<div class="spinner-grow text-success"></div>' +
    "</td>" +
    "</tr>";
  let day = document.getElementById("otherSaleDay").value;
  let month = document.getElementById("otherSaleMonth").value;
  let year = document.getElementById("otherSaleYear").value;

  //get sales for the mathching date
  getOtherSales(day, month, year, saleType);
  hideLoading();
};

//function for sales search
const processSalesSearch = (e, salesType) => {
  let searchValue = e.target.value.trim();

  //get date values
  let day;
  let month;
  let year;
  if (salesType == "all") {
    day = document.getElementById("saleDay").value;
    month = document.getElementById("saleMonth").value;
    year = document.getElementById("saleYear").value;
  } else {
    day = document.getElementById("otherSaleDay").value;
    month = document.getElementById("otherSaleMonth").value;
    year = document.getElementById("otherSaleYear").value;
  }

  if (searchValue.length > 0) {
    //get matching sales
    let matchingSales = salesModel.getMatchingSales(
      searchValue,
      sales,
      salesType,
      day,
      month,
      year
    );

    //display date
    document.getElementById("dispDate").textContent = "all date";

    //display value
    if (matchingSales != false) {
      if (salesType == "cash") {
        displayMatchCashSales(matchingSales);
      } else if (salesType == "online") {
        displayMatchOnlineSales(matchingSales);
      } else if (salesType == "credit") {
        displayMatchCreditSales(matchingSales);
      } else {
        displayMatchSales(matchingSales);
      }

      if (salesType == "all") {
        //get total sales on display
        addUpDispSalesMoney(matchingSales);

        //get total cash sales on display
        addUpDispCashSales(matchingSales);

        //get total online sales on display
        addUpDispOnlineSales(matchingSales);

        //get total online sales on display
        addUpDispCreditSales(matchingSales);

        //get average disccount
        getAverageDisccount(matchingSales);

        //get balance
        getBalance(matchingSales);
      } else {
        //get total sales on display
        addUpOtherDispSalesMoney(matchingSales, salesType);

        //get average disccount
        getOtherAverageDisccount(matchingSales, salesType);

        //get balance
        getOtherBalance(matchingSales, salesType);
      }
    } else {
      document.getElementById("salesList").innerHTML =
        " <tr>" +
        ' <td colspan="5" class="text-center">' +
        "  <span>No sales found</span>" +
        " </td>" +
        " </tr>";

      allSummaryHandle(salesType);
    }
  } else {
    //click process button
    document.getElementById("processBtn").click();
  }
};
