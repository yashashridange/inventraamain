import app from "./firebase.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore(app);

//
// ADD PURCHASE
//
window.addPurchase = async function () {

  const name =
    document.getElementById("pName").value;

  const qty =
    document.getElementById("pQty").value;

  if (!name || !qty) {

    alert("Fill all fields");

    return;

  }

  try {

    await addDoc(
      collection(db, "purchases"),
      {
        name: name,
        qty: Number(qty),
        date: new Date()
      }
    );
    showNotification(
   "✅ Product Added Successfully!"
);

    document.getElementById("pName").value = "";

    document.getElementById("pQty").value = "";

    loadPurchases();

  }

  catch(error){

    console.log(error);

    alert("Error adding purchase");

  }

};

//
// LOAD PURCHASES
//
async function loadPurchases(){

  const purchaseTable =
    document.getElementById("purchaseTable");

  purchaseTable.innerHTML = `
    <tr>
      <th>Product Name</th>
      <th>Quantity</th>
      <th>Date</th>
    </tr>
  `;

  try {

    const querySnapshot =
      await getDocs(
        collection(db, "purchases")
      );

    querySnapshot.forEach((docItem)=>{

      const data = docItem.data();

      let date = "-";

      if (data.date?.seconds) {

        date = new Date(
          data.date.seconds * 1000
        ).toLocaleDateString();

      }

      const row =
        purchaseTable.insertRow();

      row.insertCell(0).innerText =
        data.name || "-";

      row.insertCell(1).innerText =
        data.qty || 0;

      row.insertCell(2).innerText =
        date;

    });

  }

  catch(error){

    console.log(error);

    alert("Purchase Report Error");

  }

}

loadPurchases();