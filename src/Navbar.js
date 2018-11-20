import React, { Component } from "react";
import { Menu, Dropdown, Icon } from "semantic-ui-react";
import { Auth } from "aws-amplify";
import { NavLink } from "react-router-dom";

class Navbar extends Component {
  state = {
    menuItems: [],
    activeMenuItem: ""
  };

  handleItemClick = (e, { name }) => this.setState({ activeMenuItem: name });

  getAuthenticatedUser = async () => await Auth.currentAuthenticatedUser();

  signOutUser = () =>
    Auth.signOut().then(() => {
      window.location.reload();
    });

  getUsername = () =>
    this.state.user && this.state.user.username ? this.state.user.username : "";

  componentDidMount() {
    this.getAuthenticatedUser().then(user => this.setState({ user: user }));
    this.setState({
      activeMenuItem: window.location.pathname.split("/")[1].toUpperCase()
    });
  }

  render() {
    const menuTrigger = (
      <span>
        <Icon name={"th"} /> MENU
      </span>
    );
    return (
      <Menu id="navbar">
        <Menu.Item>-------------------LOGO--------------------</Menu.Item>

        <Menu.Item id={"mega-menu"}>
          <Dropdown
            icon={null}
            trigger={menuTrigger}
            floating
            className="link item"
          >
            <Dropdown.Menu>
              <Dropdown.Item
                name="ALBUMS"
                active={this.state.activeMenuItem === "ALBUMS"}
                onClick={this.handleItemClick}
              >
                <NavLink to="/albums">Albums</NavLink>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Item>

        <Menu.Item>{this.state.activeMenuItem}</Menu.Item>

        <Menu.Item position="right">
          <Dropdown
            text={this.getUsername()}
            icon={null}
            floating
            className="link item"
          >
            <Dropdown.Menu>
              <Dropdown.Item onClick={this.signOutUser}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Item>
      </Menu>
    );
  }
}

export default Navbar;
