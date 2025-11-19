import { useState } from "react";
import { motion } from "framer-motion";
import Login from "./Login";
import Register from "./Register";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-700 to-blue-900 p-6">
      
      <div className="relative w-[900px] h-[550px] rounded-3xl overflow-hidden shadow-2xl bg-white">

        {/* ===========================
            1) PANEL XANH TRƯỢT CHE FORM
        ============================ */}
        <motion.div
          className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-blue-700 to-blue-500 z-30 rounded-3xl"
          initial={false}
          animate={{ x: isLogin ? 0 : 450 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          <div className="h-full flex flex-col items-center justify-center text-white px-10">

            {isLogin ? (
              <>
                <h1 className="text-3xl font-bold">Hello, Welcome!</h1>
                <p className="opacity-90 mt-2">Don’t have an account?</p>
                <button
                  onClick={() => setIsLogin(false)}
                  className="mt-4 px-6 py-2 border border-white rounded-full hover:bg-white hover:text-blue-600 transition"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold">Welcome Back!</h1>
                <p className="opacity-90 mt-2">Already have an account?</p>
                <button
                  onClick={() => setIsLogin(true)}
                  className="mt-4 px-6 py-2 border border-white rounded-full hover:bg-white hover:text-blue-600 transition"
                >
                  Login
                </button>
              </>
            )}

          </div>
        </motion.div>

        {/* ===========================
            2) PANEL TRẮNG TRƯỢT THEO PANEL XANH
        ============================ */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full flex"
          initial={false}
          animate={{ x: isLogin ? 0 : -450 }}   // white panel lùi sau
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          {/* FORM LOGIN */}
          <motion.div
            className="w-1/2 p-10"
            animate={{ opacity: isLogin ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <Login isPopup />
          </motion.div>

          {/* FORM REGISTER */}
          <motion.div
            className="w-1/2 p-10"
            animate={{ opacity: isLogin ? 0 : 1 }}
            transition={{ duration: 0.5 }}
          >
            <Register isPopup />
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
