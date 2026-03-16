# User Stories - Chilllink

## Account Management

### US-01 - Register
As a visitor, I want to create an account so that I can access Chilllink.

Acceptance criteria:
- a visitor can submit an email and a password
- the system refuses an already used email
- the system confirms successful registration

### US-02 - Log in
As a registered user, I want to log in so that I can access my workspaces and channels.

Acceptance criteria:
- a user can authenticate with valid credentials
- the system returns an access token
- invalid credentials display an error message

### US-03 - Manage profile
As an authenticated user, I want to update my profile information so that my account details stay current.

Acceptance criteria:
- the user can open the profile modal
- the user can edit personal information
- the changes are saved and displayed after refresh

### US-04 - Log out
As an authenticated user, I want to log out so that my session is closed securely.

Acceptance criteria:
- the token is removed locally
- the user is redirected to the login page

## Workspace Management

### US-05 - Browse workspaces
As an authenticated user, I want to view my workspaces so that I can access the correct collaboration space.

Acceptance criteria:
- the system lists the workspaces of the current user
- selecting a workspace loads its channels

### US-06 - Create workspace
As a workspace owner, I want to create a workspace so that I can organize a new collaboration space.

Acceptance criteria:
- the owner can create a workspace with a name
- the new workspace appears in the workspace list

### US-07 - Rename workspace
As a workspace owner, I want to rename a workspace so that its label remains relevant.

Acceptance criteria:
- the owner can edit the workspace name
- the updated name is visible in the interface

### US-08 - Delete workspace
As a workspace owner, I want to delete a workspace so that I can remove an unused collaboration space.

Acceptance criteria:
- the system asks for confirmation
- the workspace is removed from the list

### US-09 - View workspace members
As a workspace owner, I want to see workspace members so that I know who has access.

Acceptance criteria:
- the owner can open the members modal
- the system lists all workspace members

### US-10 - Add workspace member
As a workspace owner, I want to invite a user to a workspace so that they can collaborate in it.

Acceptance criteria:
- the owner can invite by email
- the added user appears in the members list
- an invalid email or unknown user returns an error

### US-11 - Remove workspace member
As a workspace owner, I want to remove a member from a workspace so that I can control access.

Acceptance criteria:
- the owner can remove another member
- the removed user no longer appears in the members list

## Channel Management

### US-12 - Browse channels
As a workspace member, I want to view the channels of a workspace so that I can navigate discussions.

Acceptance criteria:
- the system lists channels for the selected workspace
- restricted channels are visually identified

### US-13 - Create channel
As a workspace owner, I want to create a channel so that I can structure discussions.

Acceptance criteria:
- the owner can create a channel with a name
- the new channel appears in the channel list

### US-14 - Rename channel
As a workspace owner, I want to rename a channel so that its purpose remains clear.

Acceptance criteria:
- the owner can edit the channel name
- the new name is immediately visible

### US-15 - Delete channel
As a workspace owner, I want to delete a channel so that I can remove an obsolete discussion space.

Acceptance criteria:
- the system asks for confirmation
- the channel disappears from the channel list

### US-16 - View channel members
As a workspace owner, I want to see channel members so that I know who can access the discussion.

Acceptance criteria:
- the owner can open the channel members modal
- the system lists all channel members

### US-17 - Add channel member
As a workspace owner, I want to add a workspace member to a channel so that they can access its messages.

Acceptance criteria:
- the owner can add a member by email
- only users already belonging to the workspace can be added
- a clear error message is displayed otherwise

### US-18 - Remove channel member
As a workspace owner, I want to remove a member from a channel so that I can restrict discussion access.

Acceptance criteria:
- the owner can remove a channel member
- the removed member no longer appears in the list

## Messaging

### US-19 - Read messages
As a channel member, I want to read messages so that I can follow the discussion.

Acceptance criteria:
- the system loads the messages of the selected channel
- messages are displayed in chronological order

### US-20 - Send message
As a channel member, I want to send a message so that I can participate in the conversation.

Acceptance criteria:
- the user can submit a text message
- the message appears in the discussion after sending

### US-21 - Receive real-time updates
As a channel member, I want to receive new messages instantly so that the discussion stays live.

Acceptance criteria:
- new messages appear without manual refresh
- typing events are received in real time

### US-22 - Restricted channel access
As a workspace member, I want restricted channels to block access when I am not a channel member so that permissions are enforced.

Acceptance criteria:
- a non-member cannot read restricted channel messages
- the interface indicates that the channel is locked
- sending a message is disabled in that case
