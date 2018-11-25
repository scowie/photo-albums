import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Card, Icon, Image } from "semantic-ui-react";
import { S3Image } from "aws-amplify-react";
import {
  SortableContainer,
  SortableElement,
  SortableHandle
} from "react-sortable-hoc";
import { API, graphqlOperation } from "aws-amplify";

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

const DragHandle = SortableHandle(() => (
  <div className={"photo-drag-handle"}>
    <Icon disabled name={"bars"} />
  </div>
));

const SortableItem = SortableElement(({ photo, sortIndex }) => (
  <Card className="pm-thumbnail-photo-card" key={photo.thumbnailKey}>
    <DragHandle />
    <div className="pm-photo-sort-position">
      <span>{sortIndex + 1}</span>
    </div>
    <NavLink to={`/albums/${photo.album.id}/photos/${photo.id}`}>
    <Image>
        {photo.thumbnailKey}
      {/* <S3Image imgKey={photo.thumbnailKey.replace("public/", "")} /> */}
    </Image>
    </NavLink>

    <Card.Content>
      <Card.Header>{photo.title}</Card.Header>
      <Card.Meta></Card.Meta>
      <Card.Description>
        {photo.description}
      </Card.Description>
    </Card.Content>
    <Card.Content extra>
      {photo.deviceMake}&nbsp;{photo.deviceModel}
    </Card.Content>
  </Card>
));

const SortableList = SortableContainer(({ photos }) => (
  <Card.Group>
    {photos.map((photo, index) => (
      <SortableItem
        key={`photo-${photo.thumbnailKey}`}
        index={index}
        sortIndex={index}
        photo={photo}
      />
    ))}
  </Card.Group>
));

class PhotosList extends Component {
  state = {
    uploadInProgress: false,
    saveInProgress: false,
    hasUnsavedChanges: false
  };

  savePhotoChanges = async photo => {
    const UpdatePhoto = `mutation UpdatePhoto($id: ID!, $sortPosition: Int, $title: String, $description: String, $isVisible: Boolean) {
        updatePhoto(input: {id: $id, sortPosition: $sortPosition, title: $title, description: $description, isVisible: $isVisible}) {
          id
          sortPosition
          title
          description
          isVisible
        }
      }`;

    this.setState({ saveInProgress: true }, async () => {
      const result = await API.graphql(
        graphqlOperation(UpdatePhoto, {
          id: photo.id,
          sortPosition: photo.sortPosition,
          title: photo.title,
          description: photo.description,
          isVisible: photo.isVisible
        })
      );
      this.setState({ saveInProgress: false });
      return result;
    });
  };

  render() {
    return (
      <div>
        <SortableList
          photos={this.props.photos.sort(makeComparator("sortPosition"))}
          axis={"xy"}
          onSortEnd={this.props.onSortEnd}
          useDragHandle={true}
        />
      </div>
    );
  }
}

export default PhotosList;
