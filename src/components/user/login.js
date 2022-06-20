import { useAuth } from './auth';
import { Form, FormGroup, Row, Col, Input, Label, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { useEffect, useState } from 'react';
import { StyledFirebaseAuth } from 'react-firebaseui';

const componentLoginFroms = {
  'login': LoginForm,
  'email': EmailLogin,
}

export default function Login(props) {
  const { user } = useAuth();

  const [form, setForm] = useState('login');

  const Component = componentLoginFroms[form];

  // if user exists, redirect to home
  useEffect(() => {
    if (user) {
      const returnTo = props.location.state?.appState?.returnTo || '/';

      props.history.replace(returnTo);
    }
  }, [user, props.history]);

  const retVal = (
    /* todo - wrap in layout container */
    <div className="container-lg container-fluid mt-lg-5">
      <div className="row pt-lg-5">
        <div className="col-md-3 offset-md-2">
          <h3 className='text-primary'>Log in or create an account</h3>
          <p>Quickly get started by signing in using your existing accounts.</p>
        </div>
        <div className="col-md-6">
          <Component {...props} setForm={setForm} />
        </div>
      </div>
      {/*
      <style jsx>{`
        h3 {
        }
      `}</style> */}
    </div>
  );

  return retVal;
}

function LoginForm(props) {
  const { firebase, setForm } = props;

  // right now, the oauth form shows a firebae domain.
  // do not worory, others use magic link as well https://stackoverflow.com/questions/47532134/changing-the-domain-shown-by-google-account-chooser

  const handleLogin = (provider) => {
    return firebase.auth().signInWithPopup(provider)
      .then((result) => {
        var credential = result.credential;

        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        // ...
      }).catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        console.error(error);
        alert(error);
        // ...
      });
  }

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    return handleLogin(googleProvider);
  }

  const handleFacebookLogin = (e) => {
    e.preventDefault();
    const facebookProvider = new firebase.auth.FacebookAuthProvider();
    return handleLogin(facebookProvider);
  }

  const handleEmailLogin = (e) => {
    e.preventDefault();
    setForm('email');
  }

  const terms = (
    <a href='#' target='_blank'>Terms of Service</a>
  );

  const privacy = (
    <a href='#' target='_blank'>Privacy Policy</a>
  );

  const retVal = (
    <Form>
      <FormGroup>
        <p className='small text-left text-muted font-weight-light'>
          By proceeding, you are agreeing to the {terms} and {privacy}.
        </p>
      </FormGroup>
      <Row form>
        <Col md={6}>
          <FormGroup>
            {/*   <Label for="about.firstName">First Name</Label>
            <Input type="text" /> */}
            <Button className='btn-block btn-light d-flex flex-row justify-content-around align-items-center' onClick={handleGoogleLogin}>
              <FontAwesomeIcon icon={faGoogle} className='mr-lg-1' />
              Continue with Google
            </Button>
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            {/* for some reason btn-primary does not work? */}
            <Button className='btn-block d-flex flex-row justify-content-around align-items-center' color='primary' onClick={handleFacebookLogin}>
              <FontAwesomeIcon icon={faFacebook} />
              Continue with Facebook
            </Button>
          </FormGroup>
        </Col>
      </Row>
      <p className='small text-center font-weight-light'>
        or
      </p>
      <FormGroup>
      <p className='small text-center text-muted font-weight-light'>
      <a href='#' onClick={handleEmailLogin}>Login with email address.</a>
        </p>
      </FormGroup>
    </Form>
  );

  return retVal;
}

function EmailLogin(props) {
  const { firebase } = props;

  // Configure FirebaseUI.
  const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
    signInSuccessUrl: props.location.state?.appState.returnTo || '/',
    // We will display Google and Facebook as auth providers.
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
  };

  return <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
}
