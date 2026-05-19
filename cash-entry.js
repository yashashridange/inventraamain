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

const entryTable =
document.getElementById(
"entryTable"
);

//
// SAVE ENTRY
//
window.saveEntry =
async function(){

const type =
document.getElementById(
"type"
).value;

const entryType =
document.getElementById(
"entryType"
).value;

const amount =
document.getElementById(
"amount"
).value;

const note =
document.getElementById(
"note"
).value;

if(!amount){

alert("Enter amount");

return;

}

await addDoc(
collection(db,"cashEntries"),
{

type,
entryType,
amount:Number(amount),
note,
date:new Date()

}
);

alert("Entry Saved");

loadEntries();

};

//
// LOAD ENTRIES
//
async function loadEntries(){

entryTable.innerHTML = `

<tr>

<th>Date</th>

<th>Mode</th>

<th>Type</th>

<th>Amount</th>

<th>Note</th>

</tr>

`;

const querySnapshot =
await getDocs(
collection(db,"cashEntries")
);

querySnapshot.forEach((docItem)=>{

const data =
docItem.data();

const row =
entryTable.insertRow();

let date = "-";

if(data.date?.seconds){

date =
new Date(
data.date.seconds * 1000
).toLocaleDateString();

}

row.insertCell(0).innerText =
date;

row.insertCell(1).innerText =
data.type;

row.insertCell(2).innerText =
data.entryType;

row.insertCell(3).innerText =
"₹ " + data.amount;

row.insertCell(4).innerText =
data.note;

});

}

loadEntries();