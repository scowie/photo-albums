import React, { Component } from "react";
import { Menu, Dropdown, Icon } from "semantic-ui-react";
import { Auth } from "aws-amplify";

class Navbar extends Component {
  state = {};

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  getAuthenticatedUser = async () => await Auth.currentAuthenticatedUser();

  signOutUser = () =>
    Auth.signOut().then(() => {
      window.location.reload();
    });

  getUsername = () =>
    this.state.user && this.state.user.username ? this.state.user.username : "";

  componentDidMount() {
    this.getAuthenticatedUser().then(user => this.setState({ user: user }));
  }

  // todo:  make array of menu item names
  // set active item and show active item in navbar

  render() {
    const { activeItem } = this.state;
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
            pointing
            className="link item"
          >
            <Dropdown.Menu>
              <Dropdown.Item>Menu Item</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Item>

        <Menu.Item position="right">
          <Dropdown
            text={this.getUsername()}
            icon={null}
            pointing
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
