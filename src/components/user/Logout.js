import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout(props) {
  const { firebase } = props;
  const navigate = useNavigate();

  useEffect(() => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        navigate("/");
      });
  }, [props.history]);

  return "Logging out…";
}
