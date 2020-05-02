/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

//globale variables
var invoices;

var invoiceOtherTemplate =
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
  '  <td><stong id="invoiceTotal"></stong></td>' +
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
  '   <td id="invoiceAmtPaid"></td>' +
  " </tr>" +
  " <tr>" +
  "  <th>Balance</th>" +
  "  <td></td>" +
  '  <td id="invoiceBalance">0</td>' +
  " </tr>" +
  "</tfoot>" +
  " </table>" +
  "<div" +
  '  class="border border-right-0 border-left-0 text-center pt-3 pb-3"' +
  ">" +
  "  <strong>THANK YOU</strong>" +
  "</div>" +
  "</div>";

//get all invoices for the mathching date
const getInvoices = (day, month, year) => {
  //get sales if sales have been defined
  let match = invoiceModel.getMatchInvoices(invoices, day, month, year);

  if (match != false) {
    displayMatchInvoices(match);

    document.getElementById("dispDate").textContent =
      day + "-" + month + "-" + year;
    //get total sales on display
    /* addUpOtherDispSalesMoney(match, saleType);

    //get average disccount
    getOtherAverageDisccount(match, saleType);

    //get balance
    getOtherBalance(match, saleType);*/
  } else {
    document.getElementById("invoicesList").innerHTML =
      " <tr>" +
      ' <td colspan="7" class="text-center">' +
      "  <span>No sales found</span>" +
      " </td>" +
      " </tr>";

    // allSummaryHandle(saleType);
  }
};

//get other invoices for the mathching date
const getOtherInvoices = (day, month, year, invoiceType) => {
  //get sales if sales have been defined
  let match = invoiceModel.getOtherMatchInvoices(
    invoices,
    day,
    month,
    year,
    invoiceType
  );

  if (match != false) {
    if (invoiceType == "cleared") {
      displayClearedMatchInvoices(match);
    } else {
      displayDebtMatchInvoices(match);
    }
    document.getElementById("dispDate").textContent =
      day + "-" + month + "-" + year;
    //get total sales on display
    /* addUpOtherDispSalesMoney(match, saleType);

    //get average disccount
    getOtherAverageDisccount(match, saleType);

    //get balance
    getOtherBalance(match, saleType);*/
  } else {
    if (invoiceType == "cleared") {
      document.getElementById("invoicesList").innerHTML =
        " <tr>" +
        ' <td colspan="7" class="text-center">' +
        "  <span>No sales found</span>" +
        " </td>" +
        " </tr>";
    } else {
      document.getElementById("invoicesList").innerHTML =
        " <tr>" +
        ' <td colspan="8" class="text-center">' +
        "  <span>No sales found</span>" +
        " </td>" +
        " </tr>";
    }

    // allSummaryHandle(saleType);
  }
};

//load current invoices page
const loadCurrentInvoices = () => {
  let date = new Date();
  let day = date.getDate();
  let month = date.getMonth();
  let year = date.getFullYear();

  //get all invoices
  let myInvoices = invoiceModel.getAllInvoices();
  myInvoices.then(({ data, headers, status }) => {
    invoices = data.rows;
    //get all invoices for the mathching date
    getInvoices(day, month, year);

    //enable button
    document.getElementById("processBtn").disabled = false;
  });

  document.getElementById("invoiceDay").value = day;
  document.getElementById("invoiceMonth").value = month;
  document.getElementById("invoiceYear").value = year;
};

//load other invoices page
const loadOtherInvoices = invoiceType => {
  let date = new Date();
  let day = date.getDate();
  let month = date.getMonth();
  let year = date.getFullYear();

  //get all invoices
  let myInvoices = invoiceModel.getAllInvoices();
  myInvoices.then(({ data, headers, status }) => {
    invoices = data.rows;
    //get other invoices for the mathching date
    getOtherInvoices(day, month, year, invoiceType);

    //enable button
    document.getElementById("processBtn").disabled = false;
  });

  document.getElementById("otherInvoiceDay").value = day;
  document.getElementById("otherInvoiceMonth").value = month;
  document.getElementById("otherInvoiceYear").value = year;
};

//process invoice for date entered
const loadInvoices = e => {
  e.preventDefault();

  document.getElementById("invoicesList").innerHTML =
    "<tr>" +
    '<td colspan="5" class="text-center" >' +
    '<div class="spinner-grow text-success"></div>' +
    "</td>" +
    "</tr>";

  let day = document.getElementById("invoiceDay").value;
  let month = document.getElementById("invoiceMonth").value;
  let year = document.getElementById("invoiceYear").value;

  //get all invoices for the mathching date
  getInvoices(day, month, year);
};

//process other  invoice for date entered
const loadOtherEnteredInvoices = (e, invoiceType) => {
  e.preventDefault();

  document.getElementById("invoicesList").innerHTML =
    "<tr>" +
    '<td colspan="5" class="text-center" >' +
    '<div class="spinner-grow text-success"></div>' +
    "</td>" +
    "</tr>";

  let day = document.getElementById("otherInvoiceDay").value;
  let month = document.getElementById("otherInvoiceMonth").value;
  let year = document.getElementById("otherInvoiceYear").value;

  //get other invoices for the mathching date
  getOtherInvoices(day, month, year, invoiceType);
};

//invoice view button
const viewInvoice = (e, invoiceId, invoiceType) => {
  //get details about this invoice
  let matchingInvoice = invoiceModel.getSelectedInvoice(invoices, invoiceId);
  let selectedInvoice = matchingInvoice[0];
  let salesLoader = salesModel.getSales();
  salesLoader.then(({ data, headers, status }) => {
    let sales = data.rows;

    //get match sales
    let matchedSales = invoiceModel.getSalesForInvoice(sales, invoiceId);
    //display and print invoice
    if (showStaticModal(invoiceOtherTemplate)) {
      if (invoiceType == "all") {
        //load purchase  invoice for all sales
        displaySalesInvoice(matchedSales);
      } else if (invoiceType == "cleared") {
        //load purchase invoice for cleared sales
        displayClearedSalesInvoice(matchedSales);
      } else {
        //load purchase invoice for debt sales
        displayDebtSalesInvoice(matchedSales);
      }
      //get info from DOM
      let saleDate = document.getElementById("dispDate").textContent;

      //add to DOM
      let { detail } = store.getSetupDetail();
      document.getElementById("companyStaticName").textContent =
        detail[0].value.companyName;
      document.getElementById("companyStaticAddress").textContent =
        detail[0].value.companyAddress;
      document.getElementById("companyStaticNumber").textContent =
        detail[0].value.branchPhone;
      document.getElementById("transTypeStatic").textContent =
        "CREDIT TRANSACTION";
      document.getElementById("date").textContent = saleDate;
      document.getElementById("invoiceId").textContent = invoiceId;
      document.getElementById("invoiceTotal").textContent =
        selectedInvoice.value.totalPrice;
      document.getElementById("disccountStatic").textContent =
        selectedInvoice.value.disccount + " %";
      document.getElementById("netPriceStatic").textContent =
        selectedInvoice.value.netPrice;
      document.getElementById("invoiceAmtPaid").textContent =
        selectedInvoice.value.amtPaid;
      document.getElementById("invoiceBalance").textContent =
        selectedInvoice.value.balance;
    }
  });
};