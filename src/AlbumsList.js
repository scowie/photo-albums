import React, { Component } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { List, Segment, Button } from "semantic-ui-react";
import { NavLink } from "react-router-dom";
import TitleBarWithInput from "./TitleBarWithInput.js";
import {
  SortableContainer,
  SortableElement,
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

const SortableItem = SortableElement(({ album }) => (
  <List.Item key={`album-${album.id}`}>
    <NavLink to={`/albums/${album.id}`}>
      <Segment className="album-segment">
        {album.sortPosition}
        &nbsp;&nbsp;
        {album.name}
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
    newAlbumName: ""
  };

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState({
      albums: arrayMove(this.state.albums, oldIndex, newIndex)
    });
  };

  navigateToNewAlbumPage = () =>
    this.setState({ shouldNavigateToNewAlbumPage: true });

  handleInputChange = event =>
    this.setState({ newAlbumName: event.target.value });

  handleSubmit = async event => {
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

  handleSaveAllAlbumChanges = () => {
    this.state.albums.forEach((album, index) => {
      this.saveAlbumChanges(album.id, index);
    });
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
  };

  albumItems() {
    return this.props.albums.sort(makeComparator("sortPosition")).map(album => (
      <List.Item key={album.id}>
        <NavLink to={`/albums/${album.id}`}>
          <Segment className="album-segment">
            {album.sortPosition}
            &nbsp;&nbsp;
            {album.name}
          </Segment>
        </NavLink>
      </List.Item>
    ));
  }

  render() {
    return (
      <div>
        <TitleBarWithInput
          title={"Galleries"}
          inputPlaceholder={"New Gallery Name"}
          inputActionName={"Create"}
          submitFunction={this.handleSubmit}
          inputName={"NewGallery"}
          inputValue={this.state.newAlbumName}
          inputChangeFunction={this.handleInputChange}
        />
        <List>{this.albumItems()}</List>
        <SortableList albums={this.state.albums} onSortEnd={this.onSortEnd} />
        <Button onClick={this.handleSaveAllAlbumChanges}>Save</Button>
      </div>
    );
  }
}

export default AlbumsList;
