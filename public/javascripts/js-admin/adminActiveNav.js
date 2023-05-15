// get the current URL
var url = window.location.href;

// check if the URL matches any of the menu item links
if (url.includes("/admin/home")) {
   // add active class to the about menu item
   document.querySelector("#dashboard-menu-item").classList.add("active");
} else if (url.includes("/admin/products")) {
   // add active class to the testimonial menu item
   document.querySelector("#products-menu-item").classList.add("active");
} else if (url.includes("/admin/category")) {
   // add active class to the products menu item
   document.querySelector("#category-menu-item").classList.add("active");
} else if (url.includes("/admin/orderStatus")) {
   // add active class to the blog menu item
   document.querySelector("#orderStatus-menu-item").classList.add("active");
} else if (url.includes("/admin/coupons")) {
   // add active class to the contact menu item
   document.querySelector("#coupons-menu-item").classList.add("active");
} else {
   // add active class to the home menu item by default
   document.querySelector("#dashboard-menu-item").classList.add("active");
}
