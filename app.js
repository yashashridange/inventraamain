import app from "./firebase.js";

import {
getFirestore,
collection,
addDoc,
getDocs
}
from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db =
getFirestore(app);

const productTable =
document.getElementById(
"productTable"
);

//
// ADD PRODUCT
//
window.addProduct =
async function(){

const name =
document.getElementById(
"name"
).value;

const price =
document.getElementById(
"price"
).value;

const qty =
document.getElementById(
"qty"
).value;

const unit =
document.getElementById(
"unit"
).value;

const expiry =
document.getElementById(
"expiry"
).value;

const gst =
document.getElementById(
"gst"
).value;

await addDoc(
collection(db,"products"),
{

name:name,

price:Number(price),

qty:Number(qty),

unit:unit,

expiry:
expiry || "Undefined",

gst:
Number(gst || 0)

}
);

alert("Product Added");

loadProducts();

};

//
// LOAD PRODUCTS
//
async function loadProducts(){

productTable.innerHTML = `
<tr>

<th>Name</th>

<th>Price</th>

<th>Qty</th>

<th>Unit</th>

<th>Expiry</th>

<th>GST</th>

<th>Status</th>

</tr>
`;

const querySnapshot =
await getDocs(
collection(db,"products")
);

querySnapshot.forEach((docItem)=>{

const data =
docItem.data();

const row =
productTable.insertRow();

let status =
"OK";

let className =
"";

if(data.qty <= 5){

status =
"Low Stock";

className =
"low-stock";

}

row.className =
className;

row.insertCell(0).innerText =
data.name;

row.insertCell(1).innerText =
"₹ " + data.price;

row.insertCell(2).innerText =
data.qty;

row.insertCell(3).innerText =
data.unit;

row.insertCell(4).innerText =
data.expiry;

row.insertCell(5).innerText =
(data.gst || 0) + "%";

row.insertCell(6).innerText =
status;

});

}

loadProducts();