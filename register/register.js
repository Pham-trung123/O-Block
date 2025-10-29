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
  document.getElementById('password').addEventListener('input', validatePasswordStrength);
  document.getElementById('password').addEventListener('blur', validatePassword);
  document.getElementById('confirm').addEventListener('blur', validateConfirmPassword);
  document.getElementById('captchaInput').addEventListener('blur', validateCaptcha);
  
  // Event listeners cho toggle password
  document.getElementById('togglePassword').addEventListener('click', function() {
    togglePasswordVisibility('password', 'togglePassword');
  });
  
  document.getElementById('toggleConfirmPassword').addEventListener('click', function() {
    togglePasswordVisibility('confirm', 'toggleConfirmPassword');
  });
});

// Hàm tạo CAPTCHA
function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
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

// Hàm toggle hiển thị mật khẩu
function togglePasswordVisibility(inputId, buttonId) {
  const passwordInput = document.getElementById(inputId);
  const toggleButton = document.getElementById(buttonId);
  const icon = toggleButton.querySelector('i');
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    icon.className = 'fas fa-eye-slash';
    toggleButton.classList.add('active');
  } else {
    passwordInput.type = 'password';
    icon.className = 'fas fa-eye';
    toggleButton.classList.remove('active');
  }
}

// Hàm kiểm tra độ mạnh mật khẩu
function validatePasswordStrength() {
  const password = document.getElementById('password').value;
  const strengthFill = document.getElementById('strengthFill');
  const strengthText = document.getElementById('strengthText');
  
  if (!password) {
    strengthFill.className = 'strength-fill';
    strengthText.className = 'strength-text';
    strengthText.textContent = 'Độ mạnh mật khẩu';
    return;
  }
  
  let strength = 0;
  
  // Kiểm tra độ dài
  if (password.length >= 8) strength += 25;
  
  // Kiểm tra chữ hoa
  if (/[A-Z]/.test(password)) strength += 25;
  
  // Kiểm tra chữ thường
  if (/[a-z]/.test(password)) strength += 25;
  
  // Kiểm tra số và ký tự đặc biệt
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^A-Za-z0-9]/.test(password)) strength += 10;
  
  // Cập nhật giao diện
  if (strength < 25) {
    strengthFill.className = 'strength-fill weak';
    strengthText.className = 'strength-text weak';
    strengthText.textContent = 'Mật khẩu rất yếu';
  } else if (strength < 50) {
    strengthFill.className = 'strength-fill weak';
    strengthText.className = 'strength-text weak';
    strengthText.textContent = 'Mật khẩu yếu';
  } else if (strength < 75) {
    strengthFill.className = 'strength-fill medium';
    strengthText.className = 'strength-text medium';
    strengthText.textContent = 'Mật khẩu trung bình';
  } else if (strength < 90) {
    strengthFill.className = 'strength-fill strong';
    strengthText.className = 'strength-text strong';
    strengthText.textContent = 'Mật khẩu mạnh';
  } else {
    strengthFill.className = 'strength-fill very-strong';
    strengthText.className = 'strength-text very-strong';
    strengthText.textContent = 'Mật khẩu rất mạnh';
  }
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
      showSuccessMessage('🎉 Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
      
      // Reset form
      document.getElementById('registerForm').reset();
      generateCaptcha();
      clearAllErrors();
      validatePasswordStrength();
      
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

// Hàm hiển thị thông báo thành công
function showSuccessMessage(message) {
  const existingAlert = document.querySelector('.alert-message');
  if (existingAlert) {
    existingAlert.remove();
  }
  
  const alert = document.createElement('div');
  alert.className = 'alert-message success';
  alert.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>${message}</span>
  `;
  
  document.querySelector('.register-container').insertBefore(alert, document.querySelector('#registerForm'));
  
  // Thêm CSS cho alert
  if (!document.querySelector('#alert-styles')) {
    const style = document.createElement('style');
    style.id = 'alert-styles';
    style.textContent = `
      .alert-message {
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        animation: slideDown 0.3s ease-out;
        font-size: 0.9rem;
      }
      .alert-message.success {
        background: rgba(76, 201, 240, 0.1);
        color: #22543d;
        border: 1px solid rgba(76, 201, 240, 0.3);
      }
      @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }
}