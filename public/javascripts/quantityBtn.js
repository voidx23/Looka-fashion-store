const minusBtn = document.getElementById("minus");
const plusBtn = document.getElementById("plus");
const quantityInput = document.getElementById("quantity");

// Decrease quantity by 1 when minus button is clicked
minusBtn.addEventListener("click", function() {
  let currentQuantity = parseInt(quantityInput.value);
  if (currentQuantity > 1) {
    quantityInput.value = currentQuantity - 1;
  }
});

// Increase quantity by 1 when plus button is clicked
plusBtn.addEventListener("click", function() {
  let currentQuantity = parseInt(quantityInput.value);
  quantityInput.value = currentQuantity + 1;
});
