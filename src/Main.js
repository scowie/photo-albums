import React, { Component } from "react";
import { Grid } from "semantic-ui-react";
import {
  BrowserRouter as Router,
  Route,
  NavLink,
  Redirect
} from "react-router-dom";
import AlbumDetailsLoader from "./AlbumDetailsLoader";
import AlbumsListLoader from "./AlbumsListLoader";
import Navbar from "./Navbar";

class Main extends Component {
  render() {
    return (
      <Router>
        <div>
          <Navbar />
          <main className="layout-main">
            <div className="layout-main__content">
              <Grid padded>
                <Grid.Column>
                  <Route
                    path="/"
                    exact
                    component={() => <Redirect to="/albums" />}
                  />
                  <Route path="/albums" exact component={AlbumsListLoader} />
                  <Route
                    path="/albums/:albumId"
                    render={() => (
                      <div>
                        <NavLink to="/">Back to Albums list</NavLink>
                      </div>
                    )}
                  />
                  <Route
                    path="/albums/:albumId"
                    render={props => (
                      <AlbumDetailsLoader id={props.match.params.albumId} />
                    )}
                  />
                </Grid.Column>
              </Grid>
            </div>
          </main>
        </div>
      </Router>
    );
  }
}

export default Main;
