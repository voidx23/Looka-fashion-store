const otpInputs = document.querySelectorAll(".otp-inputs input");
const otpSubmit = document.querySelector(".otp-submit");

otpInputs[0].focus();

otpInputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    if (input.value.length === 1 && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    } else if (input.value.length === 0 && index > 0) {
      otpInputs[index - 1].focus();
    }
  });
});

otpSubmit.addEventListener("click", () => {
  let otpValue = "";
  otpInputs.forEach((input) => {
    otpValue += input.value;
  });
  console.log(otpValue); // replace with your own code to verify the OTP
});
