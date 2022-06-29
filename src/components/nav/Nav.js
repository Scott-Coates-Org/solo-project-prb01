import {
  Nav as StrapNav,
  NavItem,
  NavLink,
} from "reactstrap";
import logoSmall from "../../assets/img/spotlist.svg";

const Nav = () => {
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
