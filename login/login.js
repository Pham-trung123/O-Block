// login.js - Sửa phần kiểm tra đăng nhập
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Login page loaded');
    
    // TẠM THỜI COMMENT phần tự động chuyển hướng để test
    /*
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        console.log('ℹ️ User đã đăng nhập, chuyển hướng đến trang chủ...');
        window.location.href = "index.html";
        return;
    }
    */
    
    const loginForm = document.getElementById("loginForm");
    
    if (!loginForm) {
        console.error('❌ Không tìm thấy form đăng nhập');
        return;
    }

    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        console.log('🎯 Form submitted');

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        console.log('📧 Email:', email);
        console.log('🔑 Password:', password ? '***' : 'empty');

        if (!email || !password) {
            alert("⚠️ Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        const btn = this.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        
        try {
            btn.textContent = "Đang đăng nhập...";
            btn.disabled = true;

            console.log('🔄 Đang gửi yêu cầu đến server...');

            const response = await fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({ email, password }),
            });

            console.log('📨 Response status:', response.status);
            
            const data = await response.json();
            console.log('📦 Response data:', data);

            alert(data.message);

            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('isLoggedIn', 'true');
                
                console.log('✅ Đăng nhập thành công');
                
                setTimeout(() => {
                    window.location.href = "../index.html";
                }, 1000);
            }

        } catch (err) {
            console.error('💥 Lỗi kết nối:', err);
            alert("❌ Không thể kết nối đến server!");
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
});