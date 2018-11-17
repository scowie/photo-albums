import React, { Component } from 'react'
import PhotoDetails from './PhotoDetails'
import { API, graphqlOperation } from 'aws-amplify'

const GetPhoto = `query GetPhoto($id: ID!) {
    getPhoto(id: $id) {
      id
      album {
          id
      }
      sortPosition
      title
      description
      bucket
      fullsize {
          width
          height
          key
      }
      thumbnail {
          width
          height
          key
      }
    }
  }
`

class PhotoDetailsLoader extends Component {
    constructor(props) {
        super(props);
        this.state = {
          photo: null,
          loading: true
        }
      }
      async loadPhoto() {
        this.setState({ loading: true });
        const { data } = await API.graphql(graphqlOperation(GetPhoto, {id: this.props.id}));
        let photo;
        if (this.state.photo === null) {
          photo = data.getPhoto;
        } else {
          photo = this.state.photo;
        }
        this.setState({ 
          photo: photo,
          loading: false,
        });
      }
      componentDidMount() {
        this.loadPhoto();
      }
      render() {
        return <PhotoDetails photo={this.state.photo} />;
      }

}

export default PhotoDetailsLoader
