window.showNotification = function(message){

  const notification =
    document.createElement("div");

  notification.innerText =
    message;

  notification.style.position =
    "fixed";

  notification.style.top =
    "20px";

  notification.style.right =
    "20px";

  notification.style.background =
    "#0a2342";

  notification.style.color =
    "white";

  notification.style.padding =
    "15px 25px";

  notification.style.borderRadius =
    "8px";

  notification.style.boxShadow =
    "0 0 10px rgba(0,0,0,0.2)";

  notification.style.zIndex =
    "9999";

  notification.style.fontFamily =
    "Arial";

  document.body.appendChild(
    notification
  );

  setTimeout(()=>{

    notification.remove();

  },3000);

};