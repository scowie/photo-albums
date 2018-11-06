import React, { Component } from 'react'
import PhotosList from './PhotosList'
import S3ImageUpload from './S3ImageUpload'
import AddUsernameToAlbum from './AddUsernameToAlbum'
import { Form, Segment, Header } from 'semantic-ui-react'
import AlbumMembers from './AlbumMembers'

class AlbumDetails extends Component {
    render() {
        if (!this.props.album) return 'Loading album...';
        return (
          <Segment>
            <Header as='h3'>{this.props.album.name}</Header>
            <Segment.Group>
              <Segment>
                <AlbumMembers members={this.props.album.members} />
              </Segment>
              <Segment basic>
                <AddUsernameToAlbum albumId={this.props.album.id} />
              </Segment>
            </Segment.Group>
            <S3ImageUpload albumId={this.props.album.id}/>        
            <PhotosList photos={this.props.album.photos.items} />
            {
              this.props.hasMorePhotos && 
              <Form.Button
                onClick={this.props.loadMorePhotos}
                icon='refresh'
                disabled={this.props.loadingPhotos}
                content={this.props.loadingPhotos ? 'Loading...' : 'Load more photos'}
              />
            }
          </Segment>
        )
      }

}

export default AlbumDetails
