import { Nav as StrapNav, NavItem, NavLink } from "reactstrap"
import logoSmall from "../../assets/img/spotlist.svg"

const Nav = () => {
  return (
    <header>
      <div>
        <img src={logoSmall} alt="SpotLislogo" />
      </div>
      <StrapNav pills>
        <NavItem className="bg-accent">
          <NavLink active href="/logout">
            Logout
          </NavLink>
        </NavItem>
      </StrapNav>
    </header>
  );
}

export default Nav