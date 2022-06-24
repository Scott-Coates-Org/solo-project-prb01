import { useEffect } from 'react';

export default function Logout(props) {
  const { firebase } = props;

  useEffect(() => {
    firebase.auth().signOut().then(() => {
      props.history.replace('/login');
    });

  }, [props.history]);

  return 'Logging out…';
}
