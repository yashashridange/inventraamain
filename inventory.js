import app from "./firebase.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs
}
from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore(app);

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
document.getElementById("name").value;

const price =
document.getElementById("price").value;

const qty =
document.getElementById("qty").value;

const unit =
document.getElementById("unit").value;

const expiry =
document.getElementById("expiry").value;

const gst =
document.getElementById("gst").value = "";

if(
!name ||
!price ||
!qty ||
!unit
){

showNotification(
  "⚠ Fill all fields"
);

return;

}

try{

await addDoc(
collection(db,"products"),
{
name,
price:Number(price),
qty:Number(qty),
unit,
expiry:
expiry || "Undefined"
}
);

showNotification(
"✅ Product Added"
);

document.getElementById(
"name"
).value = "";

document.getElementById(
"price"
).value = "";

document.getElementById(
"qty"
).value = "";

document.getElementById(
"unit"
).value = "";

document.getElementById(
"expiry"
).value = "";

loadProducts();

}

catch(error){

console.log(error);

showNotification(
"❌ Error Adding Product"
);

}

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

if(data.qty <= 5){

row.classList.add(
"low-stock"
);

}

let status =
"OK";

if(data.qty <= 5){

status =
"Low Stock";

}

if(
  data.expiry &&
  data.expiry !== "Undefined"
){

  const today =
    new Date();

  today.setHours(0,0,0,0);

  const expiryDate =
    new Date(data.expiry);

  expiryDate.setHours(0,0,0,0);

  const diff =
    expiryDate - today;

  const days =
    diff / (
      1000 * 60 * 60 * 24
    );

  //
  // EXPIRED
  //
  if(days < 0){

    row.classList.add(
      "low-stock"
    );

    status =
      "❌ Expired";

  }

  //
  // TODAY / TOMORROW
  //
  else if(days <= 1){

    row.classList.add(
      "expiry-alert"
    );

    status =
      "⚠ Expiring Soon";

  }

  //
  // SAFE
  //
  else{

    status =
      "✅ OK";

  }

}

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
status;

});

}

loadProducts();