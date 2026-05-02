import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

export default function GoogleButton() {
  const handleSuccess = async (credentialResponse: any) => {
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || '';
      const res = await axios.post(
        `${API_URL}/api/auth/google-token`,
        {
          credential: credentialResponse.credential, // Send the ID Token
        }
      );

      console.log("Login success:", res.data);
      localStorage.setItem("token", res.data.token);
      window.location.href = "/";
    } catch (err) {
      console.error("Backend auth failed ❌", err);
    }
  };

  return (
    <div style={{ 
      marginTop: "1rem", 
      width: "100%", 
      display: "flex", 
      justifyContent: "center",
      alignItems: "center",
      minHeight: "45px" 
    }}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.log("Login Failed")}
        useOneTap
        theme="filled_blue"
        shape="pill"
        width="320" 
      />
    </div>
  );
}
