import React, { Component } from 'react'
import AlbumDetails from './AlbumDetails'
import { API, graphqlOperation } from 'aws-amplify'

const GetAlbum = `query GetAlbum($id: ID!, $nextTokenForPhotos: String) {
    getAlbum(id: $id) {
      id
      name
      members
      photos(sortDirection: DESC, nextToken: $nextTokenForPhotos) {
        nextToken
        items {
          thumbnail {
            width
            height
            key
          }
        }
      }
    }
  }
`

class AlbumDetailsLoader extends Component {
    constructor(props) {
        super(props);
        this.state = {
          nextTokenForPhotos: null,
          hasMorePhotos: true,
          album: null,
          loading: true
        }
      }
      async loadMorePhotos() {
        if (!this.state.hasMorePhotos) return;
        this.setState({ loading: true });
        const { data } = await API.graphql(graphqlOperation(GetAlbum, {id: this.props.id, nextTokenForPhotos: this.state.nextTokenForPhotos}));
        let album;
        if (this.state.album === null) {
          album = data.getAlbum;
        } else {
          album = this.state.album;
          album.photos.items = album.photos.items.concat(data.getAlbum.photos.items);
        }
        this.setState({ 
          album: album,
          loading: false,
          nextTokenForPhotos: data.getAlbum.photos.nextToken,
          hasMorePhotos: data.getAlbum.photos.nextToken !== null
        });
      }
      componentDidMount() {
        this.loadMorePhotos();
      }
      render() {
        return <AlbumDetails loadingPhotos={this.state.loading} album={this.state.album} loadMorePhotos={this.loadMorePhotos.bind(this)} hasMorePhotos={this.state.hasMorePhotos}/>;
      }

}

export default AlbumDetailsLoader
