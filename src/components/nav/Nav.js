import { useSelector } from "react-redux";
import { Nav as StrapNav, NavItem, NavLink, Button } from "reactstrap";
import { adminRefreshAllCombinedPlaylists } from "utils/utils";
import logoSmall from "../../assets/img/spotlist.svg";

const Nav = () => {
  const userData = useSelector(state => state.user.data)
  // admin function to synch all combined playlists
  const handleRefreshCombinedPlaylists = async () => {
    await adminRefreshAllCombinedPlaylists();
  };

  return (
    <header className="fixed-top d-flex justify-content-center align-items-center p-2 px-3">
      <div
        style={{ maxWidth: "1360px" }}
        className="d-flex justify-content-between align-items-center w-100"
      >
        <div>
          <a href="/">
            <img src={logoSmall} alt="SpotLislogo" width="75px" height="75px" />
          </a>
        </div>

        <StrapNav pills>
          {userData.admin && (
            <NavItem className="mx-2">
              <Button color="secondary" className="btn-rounded" onClick={handleRefreshCombinedPlaylists}>
                Refresh All Playlists
              </Button>
            </NavItem>
          )}
          <NavItem className="bg-accent btn-rounded">
            <NavLink href="/logout">
              <b>Logout</b>
            </NavLink>
          </NavItem>
        </StrapNav>
      </div>
    </header>
  );
};

export default Nav;
