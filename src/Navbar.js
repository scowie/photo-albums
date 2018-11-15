import React, { Component } from 'react'
import { Menu, Dropdown } from 'semantic-ui-react'
import { Auth } from 'aws-amplify'

class Navbar extends Component {

    state = {}

    handleItemClick = (e, { name }) => this.setState({ activeItem: name })

    getAuthenticatedUser = async () => await Auth.currentAuthenticatedUser()

    signOutUser = () => Auth.signOut().then(() => {
        window.location.reload()
    })

    getUsername = () => this.state.user && this.state.user.username ? this.state.user.username : ""

    componentDidMount() {
        this.getAuthenticatedUser().then(user => this.setState({user: user}))
    }

    render () {
        const { activeItem } = this.state
        return (
            <Menu id="navbar">
                <Menu.Menu position='right'>
                    <Menu.Item>
                    <Dropdown text={this.getUsername()} pointing className="link item">
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={this.signOutUser}>Logout</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    </Menu.Item>
                </Menu.Menu>
            </Menu>
        )
    }
}

export default Navbar
