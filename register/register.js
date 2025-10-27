let generatedCaptcha = "";

function generateCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  generatedCaptcha = "";
  for (let i = 0; i < 5; i++) {
    generatedCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  document.getElementById("captcha").innerText = generatedCaptcha;
  console.log('🔐 Captcha:', generatedCaptcha);
}

async function registerUser() {
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirm = document.getElementById("confirm").value.trim();
  const inputCaptcha = document.getElementById("captchaInput").value.trim();

  console.log('🎯 Starting registration...');

  // Validation
  if (!username || !email || !password || !confirm || !inputCaptcha) {
    alert("⚠️ Vui lòng điền đầy đủ thông tin!");
    return;
  }

  if (password !== confirm) {
    alert("❌ Mật khẩu nhập lại không khớp!");
    return;
  }

  if (password.length < 6) {
    alert("❌ Mật khẩu phải có ít nhất 6 ký tự!");
    return;
  }

  if (inputCaptcha !== generatedCaptcha) {
    alert("❌ Sai mã xác thực! Vui lòng thử lại.");
    generateCaptcha();
    return;
  }

  try {
    console.log('🔄 Sending request to server...');
    
    const response = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullname: username,
        email: email,
        password: password,
      }),
    });

    console.log('📨 Response status:', response.status);
    
    const data = await response.json();
    console.log('📦 Response data:', data);

    // Hiển thị thông báo
    alert(data.message);

    if (data.success) {
      setTimeout(() => {
        window.location.href = "../login/login.html";
      }, 1500);
    }

  } catch (err) {
    console.error('💥 Connection error:', err);
    alert("⚠️ Không thể kết nối server! Kiểm tra console để biết chi tiết.");
  }
}

// Khởi tạo
window.onload = () => {
  console.log('✅ Page loaded');
  generateCaptcha();
  
  document.getElementById("btnRefresh").addEventListener("click", function(e) {
    e.preventDefault();
    generateCaptcha();
  });

  document.getElementById("btnRegister").addEventListener("click", function(e) {
    e.preventDefault();
    console.log('📝 Register button clicked');
    registerUser();
  });
};