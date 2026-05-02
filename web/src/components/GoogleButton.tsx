import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export default function GoogleButton() {
  const { googleLogin } = useAuth();

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      googleLogin(credentialResponse.credential);
    }
  };

  return (
    <div style={{ 
      marginTop: "1.5rem", 
      width: "100%", 
      display: "flex", 
      justifyContent: "center",
      padding: "0 10px", 
      boxSizing: "border-box"
    }}>
      <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => console.log("Login Failed")}
          useOneTap
          theme="filled_blue"
          shape="pill"
          width="100%" // Google supports '100%' if wrapped correctly in some versions
        />
      </div>
    </div>
  );
}
