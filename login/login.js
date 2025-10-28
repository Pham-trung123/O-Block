document.addEventListener('DOMContentLoaded', function() {
  // Thêm event listener cho form
  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    login();
  });
  
  // Event listeners cho real-time validation
  document.getElementById('email').addEventListener('blur', validateEmail);
  document.getElementById('password').addEventListener('blur', validatePassword);
  
  // Kiểm tra nếu có thông tin đăng nhập được lưu
  checkRememberedLogin();
});

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

// Hàm kiểm tra thông tin đăng nhập đã lưu
function checkRememberedLogin() {
  const rememberedEmail = localStorage.getItem('rememberedEmail');
  if (rememberedEmail) {
    document.getElementById('email').value = rememberedEmail;
    document.getElementById('remember').checked = true;
  }
}

// Hàm đăng nhập chính
async function login() {
  // Validate tất cả các trường
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  
  if (isEmailValid && isPasswordValid) {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    // Hiển thị loading
    const loginBtn = document.querySelector('.login-btn');
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng nhập...';
    loginBtn.disabled = true;
    
    try {
      // Gửi request đăng nhập
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      if (res.ok) {
        // Lưu thông tin đăng nhập nếu chọn "Ghi nhớ"
        if (remember) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        // Lưu token (trong thực tế)
        localStorage.setItem('authToken', data.token);
        
        // Hiệu ứng thành công
        showSuccessMessage('Đăng nhập thành công! Đang chuyển hướng...');
        
        // Chuyển hướng sau 1.5 giây
        setTimeout(() => {
          window.location.href = '../index.html';
        }, 1500);
        
      } else {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }
      
    } catch (err) {
      // Hiển thị lỗi
      showErrorMessage(err.message || 'Lỗi kết nối đến server!');
      
      // Khôi phục nút đăng nhập
      loginBtn.innerHTML = originalText;
      loginBtn.disabled = false;
    }
  } else {
    // Cuộn đến trường đầu tiên bị lỗi
    const firstError = document.querySelector('.error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError.focus();
    }
  }
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
  
  document.querySelector('.login-body').insertBefore(alert, document.querySelector('#loginForm'));
  
  // Thêm CSS cho alert
  if (!document.querySelector('#alert-styles')) {
    const style = document.createElement('style');
    style.id = 'alert-styles';
    style.textContent = `
      .alert-message {
        padding: 12px 16px;
        border-radius: 10px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        animation: slideDown 0.3s ease-out;
      }
      .alert-message.success {
        background: #c6f6d5;
        color: #22543d;
        border: 1px solid #9ae6b4;
      }
      .alert-message.error {
        background: #fed7d7;
        color: #742a2a;
        border: 1px solid #feb2b2;
      }
      @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }
}

// Hàm hiển thị thông báo lỗi
function showErrorMessage(message) {
  const existingAlert = document.querySelector('.alert-message');
  if (existingAlert) {
    existingAlert.remove();
  }
  
  const alert = document.createElement('div');
  alert.className = 'alert-message error';
  alert.innerHTML = `
    <i class="fas fa-exclamation-triangle"></i>
    <span>${message}</span>
  `;
  
  document.querySelector('.login-body').insertBefore(alert, document.querySelector('#loginForm'));
  
  // Tự động xóa thông báo sau 5 giây
  setTimeout(() => {
    if (alert.parentNode) {
      alert.remove();
    }
  }, 5000);
}

// Xử lý đăng nhập bằng Google
document.querySelector('.social-btn.google')?.addEventListener('click', function() {
  showErrorMessage('Tính năng đăng nhập bằng Google đang được phát triển');
});

// Xử lý đăng nhập bằng GitHub
document.querySelector('.social-btn.github')?.addEventListener('click', function() {
  showErrorMessage('Tính năng đăng nhập bằng GitHub đang được phát triển');
});

// Xử lý quên mật khẩu
document.querySelector('.forgot-password')?.addEventListener('click', function(e) {
  e.preventDefault();
  showErrorMessage('Tính năng quên mật khẩu đang được phát triển');
});