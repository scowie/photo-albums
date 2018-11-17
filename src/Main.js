import React, { Component } from "react";
import { Grid } from "semantic-ui-react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import AlbumDetailsLoader from "./AlbumDetailsLoader";
import PhotoDetailsLoader from "./PhotoDetailsLoader";
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
                  <Route 
                    path="/albums" 
                    exact 
                    component={AlbumsListLoader} />
                  <Route
                    path="/albums/:albumId"
                    exact
                    render={props => (
                      <AlbumDetailsLoader id={props.match.params.albumId} />
                    )}
                  />
                  <Route
                    path="/albums/:albumId/photos/:photoId"
                    exact
                    render={props => (
                      <PhotoDetailsLoader id={props.match.params.photoId} />
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
