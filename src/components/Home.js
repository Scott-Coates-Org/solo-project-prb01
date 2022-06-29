const Home = (props) => {
  return (
    <div className="vh-100 vw-100 d-flex justify-content-center align-items-center homepage-bg p-2 overflow-hidden">
      <div className="d-flex flex-column text-center justify-content-center">
        <div className="position-relative">
          <p className="text-text logo-large text-shadow mb-n4 mb-xl-n5">
            <span className="logo-left">
              <u>Spot</u>
            </span>
            <span className="logo-right text-secondary">
              <u>List</u>
            </span>
          </p>
        </div>
        <div className="position-relative">
          <p className="text-text font-weight-bold lh-sm text-shadow headline blur-in">
            Combine & Synch your favourite playlists
          </p>
        </div>
        <div className="mt-4">
          <div className="mb-2">
            <a
              href="#"
              role="button"
              className="opacity-0 btn-lg btn-accent text-primary text-decoration-none blur-in font-weight-bold p-2 px-5"
            >
              Sign Up
            </a>
          </div>
          <div className="d-sm-none mt-4">
            <a
              href="#"
              role="button"
              className="opacity-0 btn-lg btn-text text-primary text-decoration-none blur-in font-weight-bold p-2 px-5"
            >
              Login
            </a>
          </div>

          <p className="text-text d-none d-sm-block opacity-0 blur-in">
            or{" "}
            <a href="#" className="text-text">
              <u>login</u>
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home