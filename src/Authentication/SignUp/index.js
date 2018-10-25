import React, { Component, Fragment } from "react";
import { AuthSignUp, SIGN_IN } from "../service";

export class EntrySignIn extends Component {
  constructor(props) {
    super(props);
    this.handleSignUp = this.handleSignUp.bind(this);
    this.state = {
      name: "",
      email: "",
      username: "",
      password: ""
    };
  }

  handleSignUp(e) {
    e.preventDefault();
    const { changeAuthStatus } = this.props;
    const { name, username, password, email } = this.state;
    AuthSignUp(username, password, {
      email,
      name
    })
      .then(({ authStatus, authData }) => {
        changeAuthStatus(authStatus, authData);
      })
      .catch((authStatus, authData, authError) => {
        changeAuthStatus(authStatus, authData, authError);
      });
  }

  render() {
    return (
      <Fragment>
        <form onSubmit={this.handleSignUp}>
          <h2>Sign Up</h2>
          <div>
            <div>
              <label htmlFor="name">What's your name?</label>
            </div>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Full Name (First & Last)"
              onChange={({ target: { value: name } }) =>
                this.setState({ name })
              }
              value={this.state.name}
            />
          </div>
          <div>
            <div>
              <label htmlFor="username">Username</label>
            </div>
            <input
              id="username"
              name="username"
              type="text"
              onChange={({ target: { value: username } }) =>
                this.setState({ username })
              }
              value={this.state.username}
            />
          </div>
          <div>
            <div>
              <label htmlFor="email">email</label>
            </div>
            <input
              id="email"
              name="email"
              type="email"
              onChange={({ target: { value: email } }) =>
                this.setState({ email })
              }
              value={this.state.email}
            />
          </div>
          <div>
            <div>
              <label htmlFor="username">Password</label>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              onChange={({ target: { value: password } }) =>
                this.setState({ password })
              }
              value={this.state.password}
            />
          </div>
          <input onClick={this.handleSignUp} type="submit" value="Submit" />
          {this.state.error ? (
            <div>Error! {JSON.stringify(this.state.error)}</div>
          ) : null}
        </form>
        <hr />
        <button
          type="button"
          onClick={() => this.props.changeAuthStatus(SIGN_IN)}
        >
          Click to sign in using an existing account
        </button>
      </Fragment>
    );
  }
}

export default EntrySignIn;
