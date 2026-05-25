window.addProduct =
async function(){

const name =
document.getElementById(
"name"
).value;

const qty =
Number(
document.getElementById(
"qty"
).value
);

const price =
Number(
document.getElementById(
"price"
).value
);

const gst =
Number(
document.getElementById(
"gst"
).value
);

const expiry =
document.getElementById(
"expiry"
).value;

const unit =
document.getElementById(
"unit"
).value;

if(!name || !qty){

alert(
"Enter Product Details"
);

return;

}

try{

//
// CHECK EXISTING PRODUCT
//
const querySnapshot =
await getDocs(
collection(db,"products")
);

let existingProduct = null;

querySnapshot.forEach((docItem)=>{

const data =
docItem.data();

if(

data.name
.toLowerCase()
===

name.toLowerCase()

){

existingProduct = {

id: docItem.id,

...data

};

}

});

//
// IF PRODUCT EXISTS
//
if(existingProduct){

const updatedQty =

Number(existingProduct.qty || 0)

+

qty;

await updateDoc(

doc(
db,
"products",
existingProduct.id
),

{

qty: updatedQty,

price,

gst,

expiry,

unit

}

);

alert(
"Stock Updated"
);

}

//
// NEW PRODUCT
//
else{

await addDoc(
collection(db,"products"),
{

name,

qty,

price,

gst,

expiry,

unit

}
);

alert(
"Product Added"
);

}

//
// CLEAR INPUTS
//
document.getElementById(
"name"
).value = "";

document.getElementById(
"qty"
).value = "";

document.getElementById(
"price"
).value = "";

document.getElementById(
"gst"
).value = "";

document.getElementById(
"expiry"
).value = "";

//
// RELOAD PRODUCTS
//
loadProducts();

}
catch(error){

console.log(error);

alert(
"Error Adding Product"
);

}

};
loadProducts();
