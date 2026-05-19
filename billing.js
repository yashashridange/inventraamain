import app from "./firebase.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore(app);

let products = [];
let billItems = [];
let subtotal = 0;

//
// LOAD PRODUCTS
//
async function loadProducts() {

  const productSelect =
    document.getElementById("product");

  productSelect.innerHTML =
    `<option value="">Select Product</option>`;

  products = [];

  const snapshot = await getDocs(
    collection(db, "products")
  );

  snapshot.forEach((docItem) => {

    const data = docItem.data();

    products.push({
      id: docItem.id,
      ...data
    });

    productSelect.innerHTML += `
      <option value="${docItem.id}">
        ${data.name}
      </option>
    `;

  });
}

loadProducts();

//
// AUTO FILL RATE + GST
//
window.fillRate = function () {

  const id =
    document.getElementById("product").value;

  const product =
    products.find(p => p.id === id);

  if (product) {

    document.getElementById("rate").value =
      product.price || 0;

    document.getElementById("gstBox").value =
      product.gst || 0;

  } else {

    document.getElementById("rate").value = "";
    document.getElementById("gstBox").value = "";
  }
};

//
// ADD TO BILL
//
window.addToBill = function () {

  const id = document.getElementById("product").value;
  const qty = Number(document.getElementById("qty").value);
  const rate = Number(document.getElementById("rate").value);
  const gst = Number(document.getElementById("gstBox").value || 0);

  if (!id || !qty || !rate) {
    alert("Select product and quantity");
    return;
  }

  const product = products.find(p => p.id === id);

  if (!product) return;

  const total = rate * qty;

  subtotal += total;

  billItems.push({
    product: product.name,
    qty,
    rate,
    gst,
    total
  });

  updateTable();
};

//
// UPDATE TABLE
//
function updateTable() {

  const table =
    document.getElementById("billTable");

  table.innerHTML = `
    <tr>
      <th>Product</th>
      <th>Qty</th>
      <th>Rate</th>
      <th>GST</th>
      <th>Total</th>
    </tr>
  `;

  billItems.forEach(item => {

    table.innerHTML += `
      <tr>
        <td>${item.product}</td>
        <td>${item.qty}</td>
        <td>Rs. ${item.rate}</td>
        <td>${item.gst}%</td>
        <td>Rs. ${item.total}</td>
      </tr>
    `;

  });

  let gstTotal = 0;

  billItems.forEach(item => {
    gstTotal += (item.rate * item.qty * item.gst / 100);
  });

  document.getElementById("subtotal").innerText =
    subtotal.toFixed(2);

  document.getElementById("gstTotal").innerText =
    gstTotal.toFixed(2);

  document.getElementById("grandTotal").innerText =
    (subtotal + gstTotal).toFixed(2);
}

//
// SAVE BILL
//
window.saveBill = async function () {
   if (!billItems.length) {
     alert("No items");
     return;
   }

   let gstTotal = 0;

   billItems.forEach(item => {
     gstTotal += (item.rate * item.qty * item.gst / 100);
   });

   const grandTotal = subtotal + gstTotal;

   const customerInput = document.getElementById("customer");

   const customer =
     customerInput && customerInput.value.trim()
       ? customerInput.value.trim()
       : "Walk-in Customer";

   await addDoc(collection(db, "sales"), {
     customer: customer,
     items: billItems,
     subtotal,
     gst: gstTotal,
     total: grandTotal,
     date: new Date()
   });
};
alert("Bill Saved");

  billItems = [];
  subtotal = 0;
  updateTable();
  loadProducts();


//
// PDF DOWNLOAD (FIXED GST + CLEAN)
//
window.downloadInvoice = function () {

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const money = (v) => "Rs. " + Number(v || 0).toFixed(2);

  const customerInput = document.getElementById("customer");

const customer =
customerInput && customerInput.value.trim() !== ""
  ? customerInput.value.trim()
  : "Walk-in Customer";

  const payment =
    document.getElementById("payment")?.value || "Cash";

  const date = new Date().toLocaleDateString();

  let y = 20;

  // ================= HEADER =================
  pdf.setFillColor(10, 35, 66);
  pdf.rect(0, 0, 210, 35, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.text("Matoshree General Store", 80, 20);

  pdf.setFontSize(10);
  pdf.text("Store Address: Main Market, City", 60, 28);

  
  // ================= INFO =================
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);

  pdf.text("Customer: " + customer, 15, 50);
  pdf.text("Payment: " + payment, 140, 50);
  pdf.text("Date: " + date, 15, 58);

  // ================= TABLE HEADER =================
  y = 75;

  pdf.setFillColor(30, 30, 30);
  pdf.rect(10, y, 190, 10, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(11);

  pdf.text("Product", 15, y + 7);
  pdf.text("Qty", 75, y + 7);
  pdf.text("Rate", 100, y + 7);
  pdf.text("GST%", 130, y + 7);
  pdf.text("Total", 160, y + 7);

  // ================= ITEMS =================
  pdf.setTextColor(0, 0, 0);

  y += 15;

  let subtotal = 0;
  let gstTotal = 0;

  billItems.forEach((item, i) => {

    const rate = Number(item.rate || 0);
    const qty = Number(item.qty || 0);
    const gst = Number(item.gst || 0);

    const itemTotal = rate * qty;
    const gstAmount = itemTotal * gst / 100;

    subtotal += itemTotal;
    gstTotal += gstAmount;

    if (i % 2 === 0) {
      pdf.setFillColor(245, 245, 245);
      pdf.rect(10, y - 5, 190, 10, "F");
    }

    pdf.text(String(item.product), 15, y);
    pdf.text(String(qty), 75, y);
    pdf.text(money(rate), 100, y);
    pdf.text(gst + "%", 130, y);
    pdf.text(money(itemTotal + gstAmount), 160, y);

    y += 10;
  });

  // ================= TOTALS =================
  const grandTotal = subtotal + gstTotal;

  y += 10;

  pdf.setDrawColor(0);
  pdf.rect(120, y, 80, 40);

  pdf.setFontSize(11);

  pdf.text("Subtotal:", 125, y + 10);
  pdf.text(money(subtotal), 170, y + 10);

  pdf.text("GST:", 125, y + 18);
  pdf.text(money(gstTotal), 170, y + 18);

  pdf.setFontSize(13);
  pdf.text("Grand Total:", 125, y + 30);
  pdf.text(money(grandTotal), 170, y + 30);

  // ================= FOOTER FIX (IMPORTANT) =================
  y += 60;

  pdf.setFontSize(12);
  pdf.setTextColor(10, 35, 66);

  pdf.text("Thank You For Shopping With Us!", 55, y);


  pdf.save("Invoice.pdf");
};