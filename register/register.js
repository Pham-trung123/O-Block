// public/register/register.js
let generatedCaptcha = "";

function generateCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  generatedCaptcha = "";
  for (let i = 0; i < 5; i++) {
    generatedCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  document.getElementById("captcha").innerText = generatedCaptcha;
}

async function register() {
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirm = document.getElementById("confirm").value.trim();
  const inputCaptcha = document.getElementById("captchaInput").value.trim();

  if (!username || !email || !password || !confirm || !inputCaptcha)
    return alert("Vui lòng điền đầy đủ thông tin!");

  if (password !== confirm) return alert("Mật khẩu nhập lại không khớp!");
  if (inputCaptcha !== generatedCaptcha)
    return alert("Sai mã xác thực! Vui lòng thử lại.");

  try {
    const res = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullname: username }),
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) window.location.href = "../login/login.html";
  } catch (err) {
    alert("Lỗi khi kết nối server!");
    console.error(err);
  }
}

window.onload = generateCaptcha;
