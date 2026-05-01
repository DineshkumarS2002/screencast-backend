import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

export default function GoogleButton() {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
        const res = await axios.post(
          `${API_URL}/api/auth/google-token`,
          {
            access_token: tokenResponse.access_token,
          }
        );

        console.log("Login success:", res.data);
        // Store token and redirect
        localStorage.setItem("token", res.data.token);
        window.location.href = "/";
      } catch (err) {
        console.error("Backend auth failed ❌", err);
      }
    },
    onError: () => console.log("Login Failed"),
  });

  return (
    <button 
      onClick={() => login()}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        width: "100%",
        maxWidth: "340px",
        padding: "10px 16px",
        borderRadius: "8px",
        border: "1px solid #dadce0",
        backgroundColor: "#fff",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: 500,
        color: "#3c4043",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        marginTop: "1rem"
      }}
    >
      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="google"
        style={{ width: "18px", height: "18px" }}
      />
      <span>Continue with Google</span>
    </button>
  );
}
