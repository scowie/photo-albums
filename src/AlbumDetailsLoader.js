import React, { Component } from "react";
import AlbumDetails from "./AlbumDetails";
import { API, graphqlOperation } from "aws-amplify";
import { Connect } from "aws-amplify-react";

const GetAlbum = `query GetAlbum($id: ID!, $nextTokenForPhotos: String) {
    getAlbum(id: $id) {
      id
      name
      members
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

// Subscribe to creation of Todo
// const newPhotoSubscription = API.graphql(
//   graphqlOperation(SubscribeToNewPhotos)
// ).subscribe({
//   next: (photo) => console.log(todoData)
// });

class AlbumDetailsLoader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nextTokenForPhotos: null
    };
  }

  getAlbum() {
    return API.graphql(graphqlOperation(GetAlbum, {
      id: this.props.id,
      nextTokenForPhotos: this.state.nextTokenForPhotos
    })).then(resp => {
      return resp.data.getAlbum
    });
  }

  componentDidMount() {
    this.getAlbum().then(album => {
      this.setState({album: album})
    })
  }

  componentDidUpdate(prevProps) {
    if(prevProps != this.props) {
      this.getAlbum().then(album => {
        this.setState({album: album})
      })
    }
    
  }

  onNewPhoto = (prevQuery, newData) => {
    let updatedQuery = Object.assign({}, prevQuery);
    updatedQuery.getAlbum.photos.items = prevQuery.getAlbum.photos.items.concat(
      [newData.onCreatePhoto]
    );
    return updatedQuery;
  };

  render() {
      return (
        // <Connect
        //   query={graphqlOperation(GetAlbum, {
        //     id: this.props.id,
        //     nextTokenForPhotos: this.state.nextTokenForPhotos
        //   })}
        //   subscription={graphqlOperation(SubscribeToNewPhotos)}
        //   onSubscriptionMsg={this.onNewPhoto}
        // >
        //   {({ data, loading, errors }) => {
        //     if (loading) {
        //       return <div>Loading...</div>;
        //     }
        //     if (!data.getAlbum) return;

        //     if (data.getAlbum.photos && data.getAlbum.photos.nextToken) {
        //       this.setState({
        //         nextTokenForPhotos: data.getAlbum.photos.nextToken
        //       });
        //     }
        //     return <AlbumDetails album={data.getAlbum} />;
        //   }}
        // </Connect>
        <AlbumDetails album={this.state.album} />
      );
    
  }
}

export default AlbumDetailsLoader;
