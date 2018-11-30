import React, { Component } from "react";
import { Card, Image, Checkbox, Icon } from "semantic-ui-react";
import { S3Image } from "aws-amplify-react";
import {
  SortableContainer,
  SortableElement,
  SortableHandle
} from "react-sortable-hoc";
import { NavLink } from "react-router-dom";
import { API, graphqlOperation } from "aws-amplify";

const DragHandle = SortableHandle(() => (
  <div className={"photo-drag-handle"}>
    <Icon disabled name={"bars"} />
  </div>
));

class SortableItem extends Component {
  state = {
    checked: false
  };

  handleSelectionClick() {
    if (this.state.checked) {
      this.props.removeFileToBeDeleted(this.props.photo.id);
      this.setState({ checked: false });
    } else {
      this.props.addFileToBeDeleted(this.props.photo.id);
      this.setState({ checked: true });
    }
  }

  getSortableElement = () => SortableElement(() => (
    <Card
      className="pm-thumbnail-photo-card"
      key={this.props.photo.thumbnailKey}
    >
      <Checkbox
        checked={this.state.checked}
        className="pm-photo-selection-checkbox"
        onClick={this.handleSelectionClick.bind(this)}
      />
      <DragHandle />
      <div className="pm-photo-sort-position">
        <span>{this.props.sortIndex + 1}</span>
      </div>
      <NavLink
        to={`/albums/${this.props.photo.album.id}/photos/${
          this.props.photo.id
        }`}
      >
        <Image>
          <S3Image
            imgKey={this.props.photo.thumbnailKey.replace("public/", "")}
          />
        </Image>
      </NavLink>

      <Card.Content>
        <Card.Header>{this.props.photo.title}</Card.Header>
        <Card.Meta />
        <Card.Description>{this.props.photo.description}</Card.Description>
      </Card.Content>
      <Card.Content extra>
        {this.props.photo.deviceMake}&nbsp;{this.props.photo.deviceModel}
      </Card.Content>
    </Card>))

  render() {
    return SortableElement(() => (
      <Card
        className="pm-thumbnail-photo-card"
        key={this.props.photo.thumbnailKey}
      >
        <Checkbox
          checked={this.state.checked}
          className="pm-photo-selection-checkbox"
          onClick={this.handleSelectionClick.bind(this)}
        />
        <DragHandle />
        <div className="pm-photo-sort-position">
          <span>{this.props.sortIndex + 1}</span>
        </div>
        <NavLink
          to={`/albums/${this.props.photo.album.id}/photos/${
            this.props.photo.id
          }`}
        >
          <Image>
            <S3Image
              imgKey={this.props.photo.thumbnailKey.replace("public/", "")}
            />
          </Image>
        </NavLink>

        <Card.Content>
          <Card.Header>{this.props.photo.title}</Card.Header>
          <Card.Meta />
          <Card.Description>{this.props.photo.description}</Card.Description>
        </Card.Content>
        <Card.Content extra>
          {this.props.photo.deviceMake}&nbsp;{this.props.photo.deviceModel}
        </Card.Content>
      </Card>))
  }
}

export default SortableItem;
