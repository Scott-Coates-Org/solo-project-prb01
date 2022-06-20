import 'bootstrap/dist/css/bootstrap.min.css';
import Home from 'components/home';
import { AuthProvider, useAuth } from 'components/user/auth';
import Login from 'components/user/login';
import Logout from 'components/user/logout';
import { firebase } from 'firebase/client';
import { createBrowserHistory } from 'history';
import { useEffect } from "react";
import { Provider, useDispatch } from 'react-redux';
import { Route, Router, Switch } from "react-router-dom";
import store from 'redux/store';
import { getData, getDataSuccess } from 'redux/user';
import ErrorBoundary from 'components/error-boundary';

// DO NOT import BrowserRouter (as per tutorial). that caused router to not actually do anything.
// see here: https://stackoverflow.com/questions/63554233/react-router-v5-history-push-changes-the-address-bar-but-does-not-change-the
// https://github.com/ReactTraining/react-router/issues/4059#issuecomment-254437084
// this is incredibly common but not our problem: https://stackoverflow.com/questions/62449663/react-router-with-custom-history-not-working
export const history = createBrowserHistory();

function withReduxProvider(Component) {
  return function withReduxProvider(props) {
    return (
      <Provider store={store}>
        <Component {...props} />
      </Provider>
    );
  };
}

function App() {
  const props = {};

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getData());
  }, []);

  const storeUserData = user => {
    const providerData = user.providerData[0];

    const userData = { ...providerData, uid: user.uid, };

    dispatch(getDataSuccess(userData));
  };

  const appElement = (
    <ErrorBoundary>
      <AuthProvider onLogin={storeUserData}>
        <Router history={history}>
          <Switch>
            <Route path="/login" render={(routeProps) => <Login {...routeProps} {...props} firebase={firebase} />} />
            <Route path="/logout" render={(routeProps) => <Logout {...routeProps} {...props} firebase={firebase} />} />

            {/* this must be on the bottom */}
            <ProtectedRoute path="/" component={Home} {...props} />
          </Switch>
        </Router>
      </AuthProvider >
    </ErrorBoundary>
  );

  return appElement;
}

const AppWithRedux = withReduxProvider(App);
export default AppWithRedux;

// https://github.com/auth0/auth0-react/blob/master/EXAMPLES.md#1-protecting-a-route-in-a-react-router-dom-app
const ProtectedRoute = ({ component, ...args }) => {
  const WrappedComponent = withAuthenticationRequired(component, {
    onRedirecting: () => "resuming session…",
  });

  const retVal = (
    <Route render={(routeProps) => <WrappedComponent {...routeProps} {...args} />} />
  );

  return retVal;
};

// much of this was copied from auth0 lib
// node_modules/@auth0/auth0-react/src/with-authentication-required.tsx
function withAuthenticationRequired(Component, options) {
  return function WithAuthenticationRequired(props) {
    const { isAuthenticated, isLoaded } = useAuth();

    const {
      returnTo = defaultReturnTo,
      onRedirecting = defaultOnRedirecting,
      loginOptions = {},
    } = options;


    useEffect(async () => {
      let isAuthorized = false;

      if (isLoaded) {
        isAuthorized = isAuthenticated;

        if (!isAuthorized) {
          const opts = {
            ...loginOptions,
            appState: {
              ...loginOptions.appState,
              returnTo: typeof returnTo === 'function' ? returnTo() : returnTo,
            },
          };

          history.push('/login', opts)
        }
      }

    }, [history, isAuthenticated, loginOptions, returnTo]);

    return isAuthenticated ? <Component {...props} /> : onRedirecting();
  };
}

const defaultReturnTo = () => `${window.location.pathname}${window.location.search}`;

const defaultOnRedirecting = () => <></>;
