import React, { Component, Fragment } from "react";
import { AuthSignIn, SIGN_UP } from "../service";

export class EntrySignIn extends Component {
  constructor(props) {
    super(props);
    this.handleSignin = this.handleSignin.bind(this);
    this.state = {
      username: "",
      password: "",
      error: null
    };
  }

  handleSignin(e) {
    e.preventDefault();
    const { changeAuthStatus } = this.props;
    const { username, password } = this.state;
    AuthSignIn(username, password)
      .then(resp => {
        const authStatus = resp.authStatus
        const authData = resp.authData
        changeAuthStatus(authStatus, authData);
      })
      .catch((authStatus, authData, authError) => {
        this.setState({ error: authError });
        changeAuthStatus(authStatus, authData, authError);
      });
  }

  render() {
    return (
      <Fragment>
        <form onSubmit={this.handleSignin}>
          <h2>Signin using AWS</h2>
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
          <input onClick={this.handleSignin} type="submit" value="Login" />
          {this.state.error ? (
            <div>Error! {JSON.stringify(this.state.error)}</div>
          ) : null}
        </form>
        <hr />
        <button
          type="button"
          onClick={() => this.props.changeAuthStatus(SIGN_UP)}
        >
          Click to sign up
        </button>
      </Fragment>
    );
  }
}

export default EntrySignIn;
