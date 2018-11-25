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
`

class AlbumDetailsLoader extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       nextTokenForPhotos: null,
//       hasMorePhotos: true,
//       album: null,
//       loading: true
//     };
//   }

    constructor(props) {
        super(props);
        this.state = {
            nextTokenForPhotos: null
        }
    }

  onNewPhoto = (prevQuery, newData) => {
    // When we get data about a new photo,
    // we need to put it into an object
    // with the same shape as the original query results,
    // but with the new data added as well
    let updatedQuery = Object.assign({}, prevQuery)
    updatedQuery.getAlbum.photos.items = prevQuery.getAlbum.photos.items.concat([
      newData.onCreatePhoto
    ])
    return updatedQuery
  }


//   async loadMorePhotos() {
//     if (!this.state.hasMorePhotos) return;
//     this.setState({ loading: true });
//     const { data } = await API.graphql(
//       graphqlOperation(GetAlbum, {
//         id: this.props.id,
//         nextTokenForPhotos: this.state.nextTokenForPhotos
//       })
//     );
//     let album;
//     if (this.state.album === null) {
//       album = data.getAlbum;
//     } else {
//       album = this.state.album;
//       album.photos.items = album.photos.items.concat(
//         data.getAlbum.photos.items
//       );
//     }
//     this.setState({
//       album: album,
//       loading: false,
//       nextTokenForPhotos: data.getAlbum.photos.nextToken,
//       hasMorePhotos: data.getAlbum.photos.nextToken !== null
//     });
//   }


//   componentDidMount() {
//     this.loadMorePhotos();
//   }
  render() {
      console.log('id', this.props.id)
      if(this.props.id) {
        return             <Connect
        query={graphqlOperation(GetAlbum, {
          id: this.props.id,
          nextTokenForPhotos: this.state.nextTokenForPhotos
        })}
        subscription={graphqlOperation(SubscribeToNewPhotos)}
        onSubscriptionMsg={this.onNewPhoto}
      >

        {({ data, loading, errors }) => {
          if (loading) {
            return <div>Loading...</div>
          }
          if (!data.getAlbum) return

          if( data.getAlbum.photos && data.getAlbum.photos.nextToken) {
              this.setState({nextTokenForPhotos: data.getAlbum.photos.nextToken})
          }
          return <AlbumDetails
          album={data.getAlbum}
        />

        }}
    </Connect>
      }
      return <div>nothing</div>
  }
}

export default AlbumDetailsLoader;
