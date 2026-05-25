import app from "./firebase.js";

import {
getFirestore,
collection,
addDoc,
getDocs,
updateDoc,
doc
}
from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db =
getFirestore(app);

let products = [];

let billItems = [];

let subtotal = 0;

//
// LOAD PRODUCTS
//
async function loadProducts(){

const productSelect =
document.getElementById(
"product"
);

productSelect.innerHTML = `

<option value="">
Select Product
</option>

`;

products = [];

const querySnapshot =
await getDocs(
collection(db,"products")
);

querySnapshot.forEach((docItem)=>{

const data =
docItem.data();

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
window.fillRate =
function(){

const productId =
document.getElementById(
"product"
).value;

const selectedProduct =
products.find(

(item)=>

item.id === productId

);

if(selectedProduct){

document.getElementById(
"rate"
).value =
selectedProduct.price || 0;

document.getElementById(
"gstBox"
).value =
selectedProduct.gst || 0;

}
else{

document.getElementById(
"rate"
).value = "";

document.getElementById(
"gstBox"
).value = "";

}

};

//
// ADD PRODUCT
//
window.addToBill =
function(){

const productId =
document.getElementById(
"product"
).value;

const qty =
Number(
document.getElementById(
"qty"
).value
);

const rate =
Number(
document.getElementById(
"rate"
).value
);

const gst =
Number(
document.getElementById(
"gstBox"
).value
);

if(!productId || !qty){

alert(
"Select Product & Qty"
);

return;

}

const product =
products.find(
(p)=> p.id === productId
);

if(!product){

alert(
"Product not found"
);

return;

}

//
// STOCK CHECK
//
if(qty > Number(product.qty || 0)){

alert(
"Low Stock"
);

return;

}

const total =
rate * qty;

subtotal += total;

billItems.push({

product:
product.name,

qty,

rate,

gst,

total

});

updateBillTable();

//
// CLEAR QTY
//
document.getElementById(
"qty"
).value = "";

};

//
// UPDATE TABLE
//
function updateBillTable(){

const table =
document.getElementById(
"billTable"
);

table.innerHTML = `

<tr>

<th>Product</th>

<th>Qty</th>

<th>Rate</th>

<th>GST</th>

<th>Total</th>

</tr>

`;

billItems.forEach((item)=>{

table.innerHTML += `

<tr>

<td>
${item.product}
</td>

<td>
${item.qty}
</td>

<td>
₹ ${item.rate}
</td>

<td>
${item.gst}%
</td>

<td>
₹ ${item.total}
</td>

</tr>

`;

});

const gstTotal =
billItems.reduce(

(sum,item)=>

sum +
(
(item.rate * item.qty)
*
(item.gst / 100)
),

0

);

const grandTotal =
subtotal + gstTotal;

document.getElementById(
"subtotal"
).innerText =
subtotal.toFixed(2);

document.getElementById(
"gstTotal"
).innerText =
gstTotal.toFixed(2);

document.getElementById(
"grandTotal"
).innerText =
grandTotal.toFixed(2);

}

//
// SAVE BILL
//
window.saveBill =
async function(){

if(billItems.length === 0){

alert(
"No products added"
);

return;

}

const customer =
document.getElementById(
"customer"
).value || "Walk-in Customer";

const payment =
document.getElementById(
"payment"
).value || "Cash";

const gstTotal =
billItems.reduce(

(sum,item)=>

sum +
(
(item.rate * item.qty)
*
(item.gst / 100)
),

0

);

const grandTotal =
subtotal + gstTotal;

try{

//
// SAVE SALES
//
await addDoc(
collection(db,"sales"),
{

customer,

payment,

items: billItems,

subtotal,

gst: gstTotal,

total: grandTotal,

date: new Date()

}
);

//
// UPDATE STOCK
//
for(const item of billItems){

const product =
products.find(

(p)=>

p.name === item.product

);

if(product){

const updatedQty =

Number(product.qty || 0)

-

Number(item.qty || 0);

await updateDoc(

doc(
db,
"products",
product.id
),

{
qty: updatedQty
}

);

}

}

alert(
"Bill Saved Successfully"
);

//
// RESET BILL
//
billItems = [];

subtotal = 0;

updateBillTable();

loadProducts();

}
catch(error){

console.log(error);

alert(
"Error Saving Bill"
);

}

};

//
// DOWNLOAD PDF
//
window.downloadInvoice =
function(){

const {
jsPDF
} = window.jspdf;

const pdf =
new jsPDF();

const customer =
document.getElementById(
"customer"
).value || "Walk-in Customer";

const payment =
document.getElementById(
"payment"
).value || "Cash";

const date =
new Date()
.toLocaleDateString();

let y = 20;

pdf.setFontSize(24);

pdf.text(
"Matoshree Mart",
60,
20
);

pdf.setFontSize(12);

pdf.text(
"Retail Billing Invoice",
72,
28
);

pdf.line(
10,
35,
200,
35
);

pdf.text(
"Customer: " + customer,
10,
45
);

pdf.text(
"Payment: " + payment,
140,
45
);

pdf.text(
"Date: " + date,
10,
53
);

pdf.setFillColor(
10,
35,
66
);

pdf.rect(
10,
60,
190,
10,
"F"
);

pdf.setTextColor(
255,
255,
255
);

pdf.text(
"Product",
15,
67
);

pdf.text(
"Qty",
75,
67
);

pdf.text(
"Rate",
100,
67
);

pdf.text(
"GST",
130,
67
);

pdf.text(
"Total",
160,
67
);

pdf.setTextColor(
0,
0,
0
);

y = 70;

billItems.forEach((item)=>{

y += 10;

pdf.text(
String(item.product),
15,
y
);

pdf.text(
String(item.qty),
78,
y
);

pdf.text(
"₹ " + item.rate,
95,
y
);

pdf.text(
(item.gst || 0) + "%",
130,
y
);

pdf.text(
"₹ " + item.total,
160,
y
);

});

y += 20;

const gstTotal =
billItems.reduce(

(sum,item)=>

sum +
(
(item.rate * item.qty)
*
(item.gst / 100)
),

0

);

const grandTotal =
subtotal + gstTotal;

pdf.line(
120,
y-5,
200,
y-5
);

pdf.text(
"Subtotal:",
130,
y
);

pdf.text(
"₹ " +
subtotal.toFixed(2),
170,
y
);

y += 10;

pdf.text(
"GST:",
130,
y
);

pdf.text(
"₹ " +
gstTotal.toFixed(2),
170,
y
);

y += 10;

pdf.setFontSize(14);

pdf.text(
"Grand Total:",
130,
y
);

pdf.text(
"₹ " +
grandTotal.toFixed(2),
170,
y
);

y += 25;

pdf.setFontSize(12);

pdf.text(
"Thank You For Shopping!",
65,
y
);

y += 8;

pdf.text(
"Visit Again 😊",
82,
y
);

pdf.save(
"Invoice.pdf"
);

};
