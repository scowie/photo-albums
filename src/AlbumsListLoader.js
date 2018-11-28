import React, { Component } from "react";
import AlbumsList from "./AlbumsList";
import { Connect } from "aws-amplify-react";
import { graphqlOperation } from "aws-amplify";

const ListAlbums = `query ListAlbums {
    listAlbums(limit: 9999) {
        items {
            id
            name
            sortPosition
            isVisible
        }
    }
  }`;

const SubscribeToNewAlbums = `
  subscription OnCreateAlbum {
    onCreateAlbum {
      id
      name
      sortPosition
      isVisible
    }
  }
`;

class AlbumsListLoader extends Component {
  onNewAlbum = (prevQuery, newData) => {
    let updatedQuery = Object.assign({}, prevQuery);
    updatedQuery.listAlbums.items = prevQuery.listAlbums.items.concat([
      newData.onCreateAlbum
    ]);
    return updatedQuery;
  };

  render() {
    return (
      <Connect
        query={graphqlOperation(ListAlbums)}
        subscription={graphqlOperation(SubscribeToNewAlbums)}
        onSubscriptionMsg={this.onNewAlbum}
      >
        {({ data, loading, errors }) => {
          if (loading) {
            return <div>Loading...</div>;
          }
          if (!data.listAlbums) return;

          return <AlbumsList albums={data.listAlbums.items} />;
        }}
      </Connect>
    );
  }
}

export default AlbumsListLoader;
