import { Button } from "reactstrap";

const RefreshOverlay = ({ handleRefreshToken }) => {
  return (
    <div className="vh-100 vw-100 position-fixed top-0 start-0 overlay-bg">
      <div className="d-flex flex-column gap-3 position-absolute top-50 start-50 translate-middle p-4 bg-primary border border-accent rounded overlay-msg">
        <h3 className="text-text text-center">Refresh Spotify Token</h3>
        <div className="d-flex justify-content-center ">
          <Button
            color="secondary"
            className="rounded-pill"
            onClick={() => handleRefreshToken()}
          >
            Refresh Token
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RefreshOverlay;
