import React, { Component } from 'react'
import { Grid } from 'semantic-ui-react'
import { BrowserRouter as Router, Route, NavLink } from 'react-router-dom'
import AlbumDetailsLoader from './AlbumDetailsLoader'
import AlbumsListLoader from './AlbumsListLoader'
import NewAlbum from './NewAlbum'

class Main extends Component {
  render () {
    return (
      <Router>
        <Grid padded>
          <Grid.Column>
            <Route path='/' exact component={NewAlbum} />
            <Route path='/' exact component={AlbumsListLoader} />
            <Route
              path='/albums/:albumId'
              render={() => (
                <div><NavLink to='/'>Back to Albums list</NavLink></div>
              )}
            />
            <Route
              path='/albums/:albumId'
              render={props => (
                <AlbumDetailsLoader id={props.match.params.albumId} />
              )}
            />
          </Grid.Column>
        </Grid>
      </Router>
    )
  }
}

export default Main
