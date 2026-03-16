# Chilllink diagrams

This folder centralizes the project's design and architecture diagrams.

## Folders
- `architecture/`: technical architecture diagrams
- `data-models/`: UML class diagram and database models (EER, MCD, MLD, MPD)
- `functional/`: functional diagrams (use case, user stories)
- `mindmaps/`: project mind maps
- `planning/`: project planning diagrams
- `sequences/`: sequence diagrams for main user and system flows

## Main files
- `data-models/uml-class.mmd`: UML diagram (backend domain classes)
- `functional/use-case.mmd`: UML use case diagram (functional overview)
- `functional/jwt-workflow.mmd`: JWT login and token validation workflow
- `data-models/eer.mmd`: EER diagram (database entities and relationships)
- `data-models/mcd.mmd`: conceptual data model (Merise)
- `data-models/mld.mmd`: logical data model (relational schema)
- `data-models/mpd.sql`: physical data model (PostgreSQL)
- `architecture/architecture.mmd`: technical architecture (dev/prod)
- `architecture/frontend-structure.mmd`: frontend structure overview
- `architecture/backend-structure.mmd`: backend structure overview
- `mindmaps/project-mindmap.mmd`: project overview mind map
- `planning/planning.mmd`: project planning timeline

## Sequence diagrams
- `sequences/sequence-auth.mmd`: JWT authentication
- `sequences/sequence-send-message.mmd`: messaging with Mercure
- `sequences/sequence-add-channel-member.mmd`: channel membership management
- `sequences/sequence-create-workspace.mmd`: workspace creation
- `sequences/sequence-update-profile.mmd`: profile retrieval and update
- `sequences/sequence-view-locked-channel.mmd`: restricted channel access
- `sequences/sequence-login-dashboard.mmd`: login and dashboard bootstrap
- `sequences/sequence-add-workspace-member.mmd`: workspace membership invitation
- `sequences/sequence-delete-channel.mmd`: channel deletion
- `sequences/sequence-register.mmd`: account registration
- `sequences/sequence-remove-workspace-member.mmd`: workspace member removal
- `sequences/sequence-typing-event.mmd`: typing event publication
- `sequences/sequence-create-channel.mmd`: channel creation
- `sequences/sequence-rename-workspace.mmd`: workspace rename
- `sequences/sequence-delete-workspace.mmd`: workspace deletion
- `sequences/sequence-rename-channel.mmd`: channel rename
- `sequences/sequence-remove-channel-member.mmd`: channel member removal
- `sequences/sequence-list-workspace-members.mmd`: workspace members retrieval
- `sequences/sequence-list-workspaces.mmd`: workspace list retrieval
- `sequences/sequence-view-workspace.mmd`: workspace details retrieval
- `sequences/sequence-list-channels.mmd`: channel list retrieval
- `sequences/sequence-view-channel.mmd`: channel details retrieval
- `sequences/sequence-list-messages.mmd`: message history retrieval
- `sequences/sequence-view-message.mmd`: single message retrieval
- `sequences/sequence-update-message.mmd`: message edition
- `sequences/sequence-delete-message.mmd`: message deletion
- `sequences/sequence-list-channel-members.mmd`: channel members retrieval
- `sequences/sequence-get-profile.mmd`: profile retrieval

## Notes
- Verified source: Doctrine entities in `backend/src/Entity` and migrations in `backend/migrations`.
- N-N relationships are physically materialized through join tables.
