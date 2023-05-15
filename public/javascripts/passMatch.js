// Get the password and confirm password input fields
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
// Get the validation result element
const validationResult = document.getElementById('validationResult');

// Add input event listener to password input field
passwordInput.addEventListener('input', validatePasswords);
// Add input event listener to confirm password input field
confirmPasswordInput.addEventListener('input', validatePasswords);

// Function to validate password matching
function validatePasswords() {
  // Get the values of password and confirm password input fields
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Check if password and confirm password match
  if (!password && !confirmPassword) {
    // Display success message
    validationResult.textContent = '';
  } else if(password !== confirmPassword) {
    // Display error message
    validationResult.textContent = 'Password does not match!';
  }else if(password === confirmPassword){

    validationResult.textContent = 'Password matched!';
    
  }
}
