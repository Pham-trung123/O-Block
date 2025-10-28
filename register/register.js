document.addEventListener('DOMContentLoaded', function() {
  // Khởi tạo CAPTCHA
  generateCaptcha();
  
  // Thêm event listener cho form
  document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    register();
  });
  
  // Event listener cho nút refresh CAPTCHA
  document.getElementById('refreshCaptcha').addEventListener('click', generateCaptcha);
  
  // Event listeners cho real-time validation
  document.getElementById('username').addEventListener('blur', validateUsername);
  document.getElementById('email').addEventListener('blur', validateEmail);
  document.getElementById('password').addEventListener('blur', validatePassword);
  document.getElementById('confirm').addEventListener('blur', validateConfirmPassword);
  document.getElementById('captchaInput').addEventListener('blur', validateCaptcha);
});

// Hàm tạo CAPTCHA
function generateCaptcha() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let captcha = '';
  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  document.getElementById('captcha').textContent = captcha;
  
  // Thêm hiệu ứng xoay cho nút refresh
  const refreshBtn = document.getElementById('refreshCaptcha');
  refreshBtn.classList.add('loading');
  setTimeout(() => {
    refreshBtn.classList.remove('loading');
  }, 500);
}

// Hàm validate username
function validateUsername() {
  const username = document.getElementById('username').value.trim();
  const errorElement = document.getElementById('usernameError');
  const inputElement = document.getElementById('username');
  
  if (!username) {
    showError(errorElement, inputElement, 'Vui lòng nhập tên đăng nhập');
    return false;
  }
  
  if (username.length < 3) {
    showError(errorElement, inputElement, 'Tên đăng nhập phải có ít nhất 3 ký tự');
    return false;
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    showError(errorElement, inputElement, 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới');
    return false;
  }
  
  clearError(errorElement, inputElement);
  return true;
}

// Hàm validate email
function validateEmail() {
  const email = document.getElementById('email').value.trim();
  const errorElement = document.getElementById('emailError');
  const inputElement = document.getElementById('email');
  
  if (!email) {
    showError(errorElement, inputElement, 'Vui lòng nhập địa chỉ email');
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError(errorElement, inputElement, 'Địa chỉ email không hợp lệ');
    return false;
  }
  
  clearError(errorElement, inputElement);
  return true;
}

// Hàm validate password
function validatePassword() {
  const password = document.getElementById('password').value;
  const errorElement = document.getElementById('passwordError');
  const inputElement = document.getElementById('password');
  
  if (!password) {
    showError(errorElement, inputElement, 'Vui lòng nhập mật khẩu');
    return false;
  }
  
  if (password.length < 6) {
    showError(errorElement, inputElement, 'Mật khẩu phải có ít nhất 6 ký tự');
    return false;
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    showError(errorElement, inputElement, 'Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường và một số');
    return false;
  }
  
  clearError(errorElement, inputElement);
  return true;
}

// Hàm validate confirm password
function validateConfirmPassword() {
  const password = document.getElementById('password').value;
  const confirm = document.getElementById('confirm').value;
  const errorElement = document.getElementById('confirmError');
  const inputElement = document.getElementById('confirm');
  
  if (!confirm) {
    showError(errorElement, inputElement, 'Vui lòng xác nhận mật khẩu');
    return false;
  }
  
  if (password !== confirm) {
    showError(errorElement, inputElement, 'Mật khẩu xác nhận không khớp');
    return false;
  }
  
  clearError(errorElement, inputElement);
  return true;
}

// Hàm validate CAPTCHA
function validateCaptcha() {
  const captchaInput = document.getElementById('captchaInput').value.trim();
  const actualCaptcha = document.getElementById('captcha').textContent;
  const errorElement = document.getElementById('captchaError');
  const inputElement = document.getElementById('captchaInput');
  
  if (!captchaInput) {
    showError(errorElement, inputElement, 'Vui lòng nhập mã xác thực');
    return false;
  }
  
  if (captchaInput !== actualCaptcha) {
    showError(errorElement, inputElement, 'Mã xác thực không chính xác');
    return false;
  }
  
  clearError(errorElement, inputElement);
  return true;
}

// Hàm hiển thị lỗi
function showError(errorElement, inputElement, message) {
  errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
  inputElement.classList.add('error');
}

// Hàm xóa lỗi
function clearError(errorElement, inputElement) {
  errorElement.textContent = '';
  inputElement.classList.remove('error');
}

// Hàm đăng ký chính
function register() {
  // Validate tất cả các trường
  const isUsernameValid = validateUsername();
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  const isConfirmValid = validateConfirmPassword();
  const isCaptchaValid = validateCaptcha();
  
  if (isUsernameValid && isEmailValid && isPasswordValid && isConfirmValid && isCaptchaValid) {
    // Hiển thị loading
    const registerBtn = document.querySelector('.register-btn');
    const originalText = registerBtn.innerHTML;
    registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    registerBtn.disabled = true;
    
    // Giả lập gửi dữ liệu
    setTimeout(() => {
      // Hiển thị thông báo thành công
      alert('🎉 Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
      
      // Reset form
      document.getElementById('registerForm').reset();
      generateCaptcha();
      clearAllErrors();
      
      // Khôi phục nút đăng ký
      registerBtn.innerHTML = originalText;
      registerBtn.disabled = false;
      
      // Chuyển hướng đến trang đăng nhập sau 2 giây
      setTimeout(() => {
        window.location.href = '../login/login.html';
      }, 2000);
      
    }, 2000);
  } else {
    // Cuộn đến trường đầu tiên bị lỗi
    const firstError = document.querySelector('.error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError.focus();
    }
  }
}

// Hàm xóa tất cả lỗi
function clearAllErrors() {
  const errorElements = document.querySelectorAll('.error-message');
  const inputElements = document.querySelectorAll('input');
  
  errorElements.forEach(element => {
    element.textContent = '';
  });
  
  inputElements.forEach(element => {
    element.classList.remove('error');
  });
}