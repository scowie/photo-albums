import React from 'react'
import { Header, Icon, List } from 'semantic-ui-react'

const AlbumMembers = (props) => (
    <div>
      <Header as='h4'>
        <Icon name='user circle' />
        <Header.Content>Members</Header.Content>
      </Header>
      <List bulleted>
          {props.members && props.members.map((member) => <List.Item key={member}>{member}</List.Item>)}
      </List>
    </div>
)

export default AlbumMembers