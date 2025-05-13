import { useEffect, useState } from "react";

import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../firebase/config";

const PhoneAuth = () => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [message, setMessage] = useState("");
  
    // 🔥 Initialize reCAPTCHA once when the component loads
    useEffect(() => {
      setupRecaptcha();
    }, []);
  
    const setupRecaptcha = () => {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "normal", // Change to "normal" if you want to see reCAPTCHA
          callback: () => {
            console.log("reCAPTCHA verified!");
          },
          "expired-callback": () => {
            console.log("reCAPTCHA expired, resetting...");
            setupRecaptcha(); // Reinitialize if expired
          },
        });
        window.recaptchaVerifier.render();
      }
    };
  
    const sendOTP = async () => {
      if (!phoneNumber.startsWith("+972")) {
        setMessage("⚠️ Enter a valid Israeli phone number (+972...)");
        return;
      }
  
      try {
        setupRecaptcha();
        const result = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
        setConfirmationResult(result);
        setMessage("✅ OTP sent! Check your phone.");
      } catch (error) {
        console.error("Error sending OTP:", error);
        setMessage(`❌ Error: ${error.message}`);
      }
    };
  
    const verifyOTP = async () => {
      if (!confirmationResult) {
        setMessage("⚠️ Please request an OTP first.");
        return;
      }
  
      try {
        const result = await confirmationResult.confirm(otp);
        setMessage(`🎉 Success! User authenticated: ${result.user.phoneNumber}`);
      } catch (error) {
        console.error("Error verifying OTP:", error);
        setMessage(`❌ Invalid OTP. Try again.`);
      }
    };
  
    return (
      <div>
        <h2>📱 Firebase Phone Authentication</h2>
        <input
          type="text"
          placeholder="Enter phone number (+972...)"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <button onClick={sendOTP}>Send OTP</button>
  
        <div id="recaptcha-container"></div>
  
        {confirmationResult && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={verifyOTP}>Verify OTP</button>
          </>
        )}
  
        <p>{message}</p>
      </div>
    );
  };
  
  export default PhoneAuth;
