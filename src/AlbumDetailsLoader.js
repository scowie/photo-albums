import React, { Component } from "react";
import AlbumDetails from "./AlbumDetails";
import { API, graphqlOperation } from "aws-amplify";
import _ from "lodash";

const GetAlbum = `query GetAlbum($id: ID!, $nextTokenForPhotos: String) {
    getAlbum(id: $id) {
      id
      name
      isVisible
      photos(sortDirection: DESC, limit:100, nextToken: $nextTokenForPhotos) {
        nextToken
        items {
            id
            album {
                id
            }
            sortPosition
            title
            description
            deviceMake
            deviceModel
            isVisible
            bucket
            fullsizeKey
            thumbnailKey
        }
      }
    }
  }
`;

const SubscribeToNewPhotos = `
  subscription OnCreatePhoto {
    onCreatePhoto {
        id
        album {
            id
        }
        sortPosition
        title
        description
        deviceMake
        deviceModel
        isVisible
        bucket
        fullsizeKey
        thumbnailKey
    }
  }
`;

const SubscribeToDeletePhoto = `
  subscription OnDeletePhoto {
    onDeletePhoto {
        id
    }
  }
`;

class AlbumDetailsLoader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nextTokenForPhotos: null
    };
  }

  async getAlbum() {
    const resp = await API.graphql(
      graphqlOperation(GetAlbum, {
        id: this.props.id,
        nextTokenForPhotos: this.state.nextTokenForPhotos
      })
    );
    return resp.data.getAlbum;
  }

  async componentDidMount() {
    const album = await this.getAlbum();
    this.setState({ album: album });

    const newPhotoSubscription = API.graphql(
      graphqlOperation(SubscribeToNewPhotos)
    ).subscribe({
      next: newPhotoData => {
        const newPhoto = newPhotoData.value.data.onCreatePhoto;
        let album = _.cloneDeep(this.state.album);
        album.photos.items.push(newPhoto);
        this.setState({ album: album });
      }
    });

    const deletePhotoSubscription = API.graphql(
      graphqlOperation(SubscribeToDeletePhoto)
    ).subscribe({
      next: deletePhotoData => {
        let album = _.cloneDeep(this.state.album);
        album.photos.items = album.photos.items.filter(
          i => i.id !== deletePhotoData.value.data.onDeletePhoto.id
        );
        this.setState({ album: album });
      }
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.getAlbum().then(album => {
        this.setState({ album: album });
      });
    }
  }

  render() {
    return <AlbumDetails album={this.state.album} />;
  }
}

export default AlbumDetailsLoader;
