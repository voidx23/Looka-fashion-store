// get the current URL
var url = window.location.href;

// check if the URL matches any of the menu item links
if (url.includes("/about")) {
   // add active class to the about menu item
   document.querySelector("#about-menu-item").classList.add("active");
} else if (url.includes("/testimonial")) {
   // add active class to the testimonial menu item
   document.querySelector("#testimonial-menu-item").classList.add("active");
} else if (url.includes("/product")) {
   // add active class to the products menu item
   document.querySelector("#products-menu-item").classList.add("active");
} else if (url.includes("/blogList")) {
   // add active class to the blog menu item
   document.querySelector("#blog-menu-item").classList.add("active");
} else if (url.includes("/contact")) {
   // add active class to the contact menu item
   document.querySelector("#contact-menu-item").classList.add("active");
} else {
   // add active class to the home menu item by default
   document.querySelector("#home-menu-item").classList.add("active");
}
