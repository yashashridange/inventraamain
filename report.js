import app from "./firebase.js";

import {
getFirestore,
collection,
getDocs
}
from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db =
getFirestore(app);

//
// LOAD SALES REPORT
//
async function loadSalesReport(){

const salesTable =
document.getElementById(
"salesTable"
);

const revenue =
document.getElementById(
"revenue"
);

const billCount =
document.getElementById(
"billCount"
);

salesTable.innerHTML = `

<tr>

<th>Date</th>

<th>Customer</th>

<th>Total</th>

<th>View Bill</th>

</tr>

`;

let totalRevenue = 0;

let totalBills = 0;

const querySnapshot =
await getDocs(
collection(db,"sales")
);

let salesData = [];

//
// STORE DATA
//
querySnapshot.forEach((docItem)=>{

salesData.push({

id: docItem.id,

...docItem.data()

});

});

//
// SORT NEWEST FIRST
//
salesData.sort((a,b)=>{

return (
(b.date?.seconds || 0)
-
(a.date?.seconds || 0)
);

});

//
// SHOW TABLE
//
salesData.forEach((data)=>{

totalBills++;

totalRevenue +=
Number(data.total || 0);

let date = "-";

if(data.date?.seconds){

date =
new Date(
data.date.seconds * 1000
).toLocaleDateString();

}

const row =
salesTable.insertRow();

row.insertCell(0).innerText =
date;

row.insertCell(1).innerText =
data.customer ||
"Walk-in Customer";

row.insertCell(2).innerText =
"₹ " + (data.total || 0);

row.insertCell(3).innerHTML = `

<button onclick='viewBill(
${JSON.stringify(
data.items || []
)}
)'>

View Bill

</button>

`;

});

revenue.innerText =
"₹ " +
totalRevenue.toFixed(2);

billCount.innerText =
totalBills;

}

//
// VIEW BILL
//
window.viewBill =
function(items){

let rows = "";

items.forEach((item)=>{

rows += `

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
${item.gst || 0}%
</td>

<td>
₹ ${item.total}
</td>

</tr>

`;

});

const newWindow =
window.open(
"",
"_blank"
);

newWindow.document.write(`

<html>

<head>

<title>
Bill Details
</title>

<style>

body{
font-family:Arial;
padding:20px;
background:#f4f6f9;
}

h1{
color:#0a2342;
}

table{
width:100%;
border-collapse:collapse;
background:white;
margin-top:20px;
}

th,td{
border:1px solid #ddd;
padding:12px;
text-align:center;
}

th{
background:#0a2342;
color:white;
}

button{
padding:10px 16px;
border:none;
background:#0a2342;
color:white;
border-radius:6px;
cursor:pointer;
margin-top:20px;
margin-right:10px;
}

button:hover{
background:#163d6b;
}

</style>

</head>

<body>

<div style="
display:flex;
align-items:center;
justify-content:space-between;
margin-bottom:20px;
">

<button
onclick="window.close()"
style="
padding:10px 16px;
border:none;
background:#0a2342;
color:white;
border-radius:6px;
cursor:pointer;
">

⬅ Back

</button>

<h1 style="
margin:0;
color:#0a2342;
">

🧾 Bill Details

</h1>

<div></div>

</div>

<table>

<tr>

<th>Product</th>

<th>Qty</th>

<th>Rate</th>

<th>GST</th>

<th>Total</th>

</tr>

${rows}

</table>

<button onclick="window.print()">
🖨 Print
</button>



</body>

</html>

`);

};

loadSalesReport();