# Postman Demo

This folder contains Postman assets for Chilllink.

## Files

- `chilllink-demo.postman_collection.json`
- `chilllink-full-api.postman_collection.json`
- `chilllink-local.postman_environment.json`

## Collections

### `chilllink-demo.postman_collection.json`

Short presentation scenario focused on:
- JWT authentication
- workspace vs channel access
- business rule enforcement

Login requests follow the Symfony `json_login` contract:
- `POST /api/login_check`
- JSON body: `{ "email": "...", "password": "..." }`
- `email` is the recommended field name
- the legacy alias `username` is also accepted when it contains the user email

### `chilllink-full-api.postman_collection.json`

Complete collection covering all exposed API routes:
- Auth
- Users
- Profile
- Workspaces
- Workspace Members
- Channels
- Channel Members
- Messages
- Typing
- Debug

## Demo goal

Show three things in a short presentation:

1. JWT authentication works
2. Workspace and channel access are not the same thing
3. A business rule is enforced: only workspace members can be added to a channel

## Recommended live scenario

Run the requests in order:

1. Register owner
2. Register member
3. Register outsider
4. Login owner
5. Login member
6. Login outsider
7. Owner creates workspace
8. Owner adds member to workspace
9. Owner creates channel
10. Member lists channels before being added
11. Member tries to open restricted channel
12. Owner tries to add outsider to channel
13. Owner adds member to channel
14. Member opens channel after being added

## What to comment during the demo

- The member belongs to the workspace but still cannot open the channel
- The outsider exists as a user but is rejected because they are not a workspace member
- The API returns a business error in French for this case
- After the owner adds the member to the channel, access is granted

## Expected highlights

### Request 11
- Expected status: `403 Forbidden`
- Meaning: user is authenticated and belongs to the workspace, but is not allowed into the channel yet

### Request 12
- Expected status: `400 Bad Request`
- Expected message:
  - `Seuls les utilisateurs appartenant au workspace peuvent etre ajoutes au channel`
- Expected code:
  - `USER_NOT_WORKSPACE_MEMBER`

### Request 14
- Expected status: `200 OK`
- Meaning: access control changes immediately after channel membership is granted

## Full API usage

Recommended order for the full collection:

1. Register owner
2. Register member
3. Register outsider
4. Login owner
5. Login member
6. Login outsider
7. Me as owner
8. Me as member
9. Create workspace
10. Add workspace member
11. Create channel
12. Add channel member
13. Send message

After that, the remaining requests can be launched independently because the main IDs and tokens are already stored in the environment.
