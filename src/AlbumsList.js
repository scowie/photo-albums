import React, { Component } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { List, Segment, Button, Input, Icon} from "semantic-ui-react";
import { NavLink } from "react-router-dom";
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  arrayMove
} from "react-sortable-hoc";

function makeComparator(key, order = "asc") {
  return (a, b) => {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) return 0;

    const aVal = typeof a[key] === "string" ? a[key].toUpperCase() : a[key];
    const bVal = typeof b[key] === "string" ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (aVal > bVal) comparison = 1;
    if (aVal < bVal) comparison = -1;

    return order === "desc" ? comparison * -1 : comparison;
  };
}

const DragHandle = SortableHandle(() => <div className={"album-drag-handle"}><Icon disabled name={"bars"}></Icon></div>); 

const SortableItem = SortableElement(({ album }) => (
  <List.Item key={`album-${album.id}`}>
    <NavLink to={`/albums/${album.id}`}>
      <Segment className="album-segment">
        <DragHandle />
        <div className={"album-segment__main-content"}>
          {album.sortPosition}
              &nbsp;&nbsp;
          {album.name}
        </div>
      </Segment>
    </NavLink>
  </List.Item>
));

const SortableList = SortableContainer(({ albums }) => {
  return (
    <List>
      {albums.map((album, index) => (
        <SortableItem key={`album-${album.sortPosition}`} index={index} album={album} />
      ))}
    </List>
  );
});

class AlbumsList extends Component {
  state = {
    albums: this.props.albums,
    newAlbumName: "",
    createInProgress: false,
    saveInProgress: false,
    hasUnsavedChanges: false
  };

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState({
      albums: arrayMove(this.state.albums, oldIndex, newIndex)
    });
  };

  handleNewGalleryInputChange = event =>
    this.setState({ newAlbumName: event.target.value });

  handleNewGallerySubmit = async event => {
    event.preventDefault();
    const NewAlbum = `mutation NewAlbum($name: String!, $sortPosition: Int) {
        createAlbum(input: {name: $name, sortPosition: $sortPosition}) {
          id
          name
          sortPosition
        }
      }`;

    const result = await API.graphql(
      graphqlOperation(NewAlbum, {
        name: this.state.newAlbumName,
        sortPosition: this.props.albums.length
      })
    );
    this.setState({ newAlbumName: "" });
    console.info(`Created album with id ${result.data.createAlbum.id}`);
  };

  handleSaveAllAlbumChanges = async () => {
    this.setState({saveInProgress: true}, async () => {
      await Promise.all(this.state.albums.map(async (album, index) => {
        await this.saveAlbumChanges(album.id, index)
      }))
      this.setState({saveInProgress: false})
    })
  };

  saveAlbumChanges = async (albumId, albumSortPosition) => {
    const UpdateAlbum = `mutation UpdateAlbum($id: ID!, $sortPosition: Int) {
        updateAlbum(input: {id: $id, sortPosition: $sortPosition}) {
          id
          name
          sortPosition
        }
      }`;
    const result = await API.graphql(
      graphqlOperation(UpdateAlbum, {
        id: albumId,
        sortPosition: albumSortPosition
      })
    );
    console.log(result);
    return result;
  };

  sortAlbums = () => this.setState({albums: this.props.albums.sort(makeComparator("sortPosition"))});

  componentDidMount(){
    this.sortAlbums();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.albums !== this.props.albums) {
      this.setState({
        albums: this.props.albums.sort(makeComparator("sortPosition")),
        hasUnsavedChanges: true
      })
    } else if (prevState.albums !== this.state.albums) {
      this.setState({hasUnsavedChanges: true})
    }
  }

  render() {
    return (
      <div>
        <div className="title-bar-container">
          <div className="title-bar-title-container">
            <h2>{"Galleries"}</h2>
          </div>
          <div className="title-bar-actions-container">
            <Input
              size="small"
              type={"text"}
              placeholder={"New Gallery Name"}
              action={{
                content: "Create",
                onClick: this.handleNewGallerySubmit
              }}
              name={"New Gallery"}
              value={this.state.newAlbumName}
              onChange={this.handleNewGalleryInputChange}
            />
            <Button 
              primary={this.state.hasUnsavedChanges}
              loading={this.state.saveInProgress} 
              disabled={this.state.createInProgress || this.state.saveInProgress || !this.state.hasUnsavedChanges} 
              size="medium" 
              onClick={this.handleSaveAllAlbumChanges} 
              style={{marginLeft:'10px'}}>Save</Button>
          </div>
        </div>
        <SortableList albums={this.state.albums} onSortEnd={this.onSortEnd} useDragHandle={true}/>
      </div>
    );
  }
}

export default AlbumsList;
