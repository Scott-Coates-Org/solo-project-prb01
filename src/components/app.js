import "bootstrap/dist/css/bootstrap.min.css";
import Home from "components/Home";
import "../../public/assets/styles";
import { AuthProvider, useAuth } from "components/user/Auth";
import Login from "components/user/Login";
import Logout from "components/user/Logout";
import { firebase } from "firebase/client";
import { createBrowserHistory } from "history";
import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import store from "redux/store";
import { getData, getDataSuccess } from "redux/user";
import ErrorBoundary from "components/error-boundary";
import Dashboard from "./dashboard/Dashboard";

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

// https://www.robinwieruch.de/react-router-private-routes/
const ProtectedRoute = ({ children, redirectPath = "/", setReturnTo }) => {
  const { isAuthenticated, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  let isAuthorized = false;
  isAuthorized = isAuthenticated;
  if (!isAuthorized) {
    return <Navigate to={redirectPath} replace />;
  }

  return isLoaded && isAuthorized ? children : <></>;
};

function App() {
  const props = { history };
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getData());
  }, []);

  const storeUserData = (user) => {
    const providerData = user.providerData[0];
    const userData = { ...providerData, uid: user.uid };

    dispatch(getDataSuccess(userData));
  };

  return (
    <ErrorBoundary>
      <AuthProvider onLogin={storeUserData}>
        <Router>
          <Routes>
            <Route exact path="/" element={<Home {...props} />} />
            <Route path="/login" element={<Login {...props} firebase={firebase} />} />
            <Route path="/logout" element={<Logout {...props} firebase={firebase} />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute redirectPath="/login" {...props}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const AppWithRedux = withReduxProvider(App);
export default AppWithRedux;
