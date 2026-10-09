> ## Documentation Index
> Fetch the complete documentation index at: https://docs.guild.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# List a workspace's installed agents

> Requires `workspaces:read` and `agents:read`.



## OpenAPI

````yaml /api-reference/openapi.yaml get /workspaces/{workspace_id_or_name}/workspace_agents
openapi: 3.0.3
info:
  title: Guild Public API
  version: 1.0.0
  description: >-
    The Guild public API, served at https://api.guild.ai/v1 and authenticated
    with account API keys (HTTP Basic, key id as the username and the secret as
    the password). See https://docs.guild.ai/api-reference/introduction for
    scopes and behavior. A session-events websocket also exists at
    wss://api.guild.ai/v1/sessions/{session_id}/events/ws with the same Basic
    auth on the handshake; OpenAPI cannot describe websockets, so it is not
    listed in paths.
servers:
  - url: https://api.guild.ai/v1
    description: Production
security: []
tags:
  - name: accounts
  - name: agents
  - name: oauth
  - name: sessions
  - name: skills
  - name: workspaces
paths:
  /workspaces/{workspace_id_or_name}/workspace_agents:
    get:
      tags:
        - workspaces
      summary: List a workspace's installed agents
      description: Requires `workspaces:read` and `agents:read`.
      operationId: get_workspace_agents
      parameters:
        - name: workspace_id_or_name
          in: path
          required: true
          schema:
            type: string
        - name: limit
          in: query
          required: false
          schema:
            default: 20
            maximum: 1000
            minimum: 0
            title: Limit
            type: integer
        - name: offset
          in: query
          required: false
          schema:
            default: 0
            maximum: 9223372036854776000
            minimum: 0
            title: Offset
            type: integer
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items:
                      $ref: '#/components/schemas/WorkspaceAgent'
                  pagination:
                    type: object
                    properties:
                      total_count:
                        type: integer
                      limit:
                        type: integer
                      offset:
                        type: integer
                      has_more:
                        type: boolean
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '404':
          description: Not Found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
      security:
        - apiKey: []
components:
  schemas:
    WorkspaceAgent:
      type: object
      properties:
        id:
          type: string
          format: uuid
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
        creator_id:
          type: string
          format: uuid
          description: The user or API key that added this agent version to the workspace.
        version_id:
          type: string
          format: uuid
        workspace_id:
          type: string
          format: uuid
        is_default_chat_agent:
          type: boolean
          description: >-
            If True, this workspace agent is used for new chat sessions when no
            explicit agent is provided.
        should_autoupdate:
          type: boolean
          description: >-
            If True, the agent will automatically update when a new version is
            published.
        required_credentials_mode:
          type: string
          enum:
            - SHARED
            - MEMBER
          nullable: true
          description: >-
            Whose credentials this agent may run with: SHARED = only org-side
            credentials serve, MEMBER = only the acting member's own. Unset =
            the workspace's declaration applies, and no requirement when that is
            unset too.
        agent:
          $ref: '#/components/schemas/Agent'
        agent_version:
          $ref: '#/components/schemas/AgentVersion'
        creator:
          $ref: '#/components/schemas/User'
        workspace:
          $ref: '#/components/schemas/Workspace'
    ErrorResponse:
      type: object
      properties:
        error:
          type: string
        message:
          type: string
    Agent:
      type: object
      properties:
        id:
          type: string
          format: uuid
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
        agent_type:
          type: string
          enum:
            - GUILD_TYPESCRIPT
            - GUILD_NATIVE
            - GOOSE
            - OPENCLAW
            - LANGGRAPH
        description:
          type: string
          description: >-
            Manual description field. Can be empty; the effective description
            falls back to generated_description.
        is_public:
          type: boolean
          description: Whether the asset is visible to the community or only its owner.
        name:
          type: string
          maxLength: 100
          description: Unique name identifying the asset within the owner account.
        owner_id:
          type: string
          format: uuid
          description: The account that owns this entity.
        cached_forks_count:
          type: integer
          description: A cached version of the forks count. Might not be up to date.
        cached_installs_count:
          type: integer
          description: A cached version of the installs count. Might not be up to date.
        cached_likes_count:
          type: integer
          description: A cached version of the likes count. Might not be up to date.
        is_pinned:
          type: boolean
          description: >-
            If true, it means the agent is pinned on the owner's account's
            profile.
        moderation_state:
          type: string
          enum:
            - ACTIVE
            - DEMOTED
            - UNLISTED
            - DISABLED
            - TAKEN_DOWN
          description: >-
            Operator-controlled moderation/curation state. Owners cannot change
            this; only operators can, via the hub kebab menu or ops tooling.
        status:
          type: string
          enum:
            - CREATED
            - GIT_REPOSITORY_CREATED
            - READY
        archived_at:
          type: string
          format: date-time
          nullable: true
        archived_by_id:
          type: string
          format: uuid
          nullable: true
        avatar_url:
          type: string
          maxLength: 255
          nullable: true
        category_id:
          type: string
          format: uuid
          nullable: true
          description: The category this agent is sorted in.
        creation_template:
          type: string
          enum:
            - LLM
            - AUTO_MANAGED_STATE
            - BLANK
            - GOOSE
            - GUILD_NATIVE
            - OPENCLAW
            - LANGGRAPH
          nullable: true
          description: >-
            If applicable, the template that was selected during the creation of
            this agent. Note: it doesn't mean the agent is still following the
            template now.
        forked_from_id:
          type: string
          format: uuid
          nullable: true
          description: >-
            If applicable, the ID of the agent version this agent was forked
            from.
        generated_description:
          type: string
          nullable: true
          description: >-
            LLM-generated description based on agent code. Regenerated
            automatically on every commit.
        maintainer_id:
          type: string
          format: uuid
          nullable: true
          description: >-
            OPTIONAL. Refers to the person within an organization that is tasked
            with maintaining the agent.
        archived_by: {}
        category: {}
        forks_count:
          type: integer
          description: Number of times this agent has been forked
        full_name:
          type: string
          description: Full agent name in format "owner_name/agent_name"
        git_url:
          type: string
          description: URL to the agent's git repository
        installs_count:
          type: integer
          description: Number of times this agent has been installed in workspaces
        is_description_autogenerated: {}
        latest_published_version: {}
        latest_version: {}
        likes_count:
          type: integer
          description: Number of likes this agent has received
        maintainer:
          type: object
          nullable: true
          description: Maintainer of the agent (for organization-owned agents)
        owner:
          $ref: '#/components/schemas/Account'
        public_profile_url: {}
        type: {}
        viewer_can_edit:
          type: boolean
          description: Whether the current viewer can edit this agent
        creator:
          type: object
          nullable: true
          description: The user who created this agent.
        last_updated_by:
          type: object
          nullable: true
          description: The user who pushed the newest version of this agent.
    AgentVersion:
      oneOf:
        - $ref: '#/components/schemas/AgentVersionCommitted'
        - $ref: '#/components/schemas/AgentVersionEphemeral'
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
        email:
          type: string
          maxLength: 100
        name:
          type: string
          maxLength: 100
          description: The unique name identifying this account.
        cached_forks_count:
          type: integer
          description: A cached version of the forks count. Might not be up to date.
        cached_forks_public_count:
          type: integer
          description: >-
            A cached version of the forks count for public agents. Might not be
            up to date.
        cached_installs_count:
          type: integer
          description: A cached version of the installs count. Might not be up to date.
        cached_installs_public_count:
          type: integer
          description: >-
            A cached version of the installs count for public agents. Might not
            be up to date.
        cached_likes_count:
          type: integer
          description: A cached version of the likes count. Might not be up to date.
        cached_likes_public_count:
          type: integer
          description: >-
            A cached version of the likes count for public agents. Might not be
            up to date.
        is_operator:
          type: boolean
          description: >-
            Whether or not the user is a Guild employee (or operator). BE VERY
            CAREFUL WITH THIS.
        notification_email_level:
          type: string
          enum:
            - NONE
            - IMPORTANT
            - ALL
          description: >-
            NONE = no emails, IMPORTANT = invitations and agent-ask only, ALL =
            all notification types.
        avatar_url:
          type: string
          maxLength: 255
          nullable: true
        banner_url:
          type: string
          maxLength: 255
          nullable: true
        bio:
          type: string
          nullable: true
        closed_at:
          type: string
          format: date-time
          nullable: true
          description: >-
            Set when an operator closes the account. A closed user cannot start
            a login session by any method.
        discord_url:
          type: string
          maxLength: 255
          nullable: true
        full_name:
          type: string
          maxLength: 100
          nullable: true
          description: The display name of the account.
        github_url:
          type: string
          maxLength: 255
          nullable: true
        hubspot_synced_at:
          type: string
          format: date-time
          nullable: true
        linkedin_url:
          type: string
          maxLength: 255
          nullable: true
        threads_url:
          type: string
          maxLength: 255
          nullable: true
        username_set_at:
          type: string
          format: date-time
          nullable: true
          description: >-
            Set when the user picks their username during onboarding. Once set,
            the username cannot be changed.
        website_url:
          type: string
          maxLength: 255
          nullable: true
        x_url:
          type: string
          maxLength: 255
          nullable: true
        youtube_url:
          type: string
          maxLength: 255
          nullable: true
        type:
          type: string
          enum:
            - user
          description: Account type, always "user"
    Workspace:
      type: object
      properties:
        id:
          type: string
          format: uuid
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
        creator_id:
          type: string
          format: uuid
        name:
          type: string
          maxLength: 100
        owner_id:
          type: string
          format: uuid
          description: The account that owns this entity.
        restrict_account_credentials:
          type: boolean
          description: >-
            When true, tasks in this workspace may not fall back to the owning
            account's shared credential pool: a resolution that would reach the
            account default is refused so the workspace must rely on credentials
            granted or connected to its agents.
        should_restrict_members:
          type: boolean
          description: >-
            When true, only workspace members (plus org admins of the owning
            org) can access this workspace; when false, it is open to the whole
            owning org.
        unlimited_power_mode:
          type: boolean
          description: >-
            When true, this workspace's execution-tree fan-out limits are raised
            to the platform ceilings instead of the default budgets. The limits
            are raised, not removed.
            https://i.ibb.co/5XsvmfKg/CFD5-C99-C-B322-46-A2-9892-AFDF484-D28-E1-1.webp
        archived_at:
          type: string
          format: date-time
          nullable: true
        archived_by_id:
          type: string
          format: uuid
          nullable: true
        required_credentials_mode:
          type: string
          enum:
            - SHARED
            - MEMBER
          nullable: true
          description: >-
            Whose credentials agents in this workspace may run with: SHARED =
            only org-side credentials serve, MEMBER = only the acting member's
            own. Unset = no requirement. A workspace agent's own declaration
            overrides this one.
        archived_by: {}
        creator: {}
        full_name:
          type: string
          description: Full workspace name in format "owner_name~workspace_name"
        is_viewer_member: {}
        members_enabled: {}
        owner:
          $ref: '#/components/schemas/Account'
        unlimited_power_mode_enabled: {}
    Account:
      oneOf:
        - $ref: '#/components/schemas/Organization'
        - $ref: '#/components/schemas/User'
    AgentVersionCommitted:
      type: object
      properties:
        id:
          type: string
          format: uuid
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
        agent_id:
          type: string
          format: uuid
        author_id:
          type: string
          format: uuid
        validation_status:
          type: string
          enum:
            - SKIPPED
            - PENDING
            - RUNNING
            - PASSED
            - FAILED
        dependencies:
          type: object
          nullable: true
          description: npm package.json dependencies
        description:
          type: string
          nullable: true
          description: Description for the agent extracted from the agent code.
        env_references:
          type: array
          items: {}
          nullable: true
          description: >-
            Workspace variable keys referenced as {{env.KEY}} in the version's
            prompt, extracted at build time
        input_schema:
          type: object
          nullable: true
          description: JSON Schema from Zod input
        output_schema:
          type: object
          nullable: true
          description: JSON Schema from Zod output
        published_at:
          type: string
          format: date-time
          nullable: true
        publishing_started_at:
          type: string
          format: date-time
          nullable: true
        raw_tools:
          type: array
          items: {}
          nullable: true
          description: >-
            Structured per-tool metadata. Each entry is a tool object
            discriminated by toolType (integration, legacy, agent, builtin).
        runtime_environment_id:
          type: string
          format: uuid
          nullable: true
        sha:
          type: string
          maxLength: 40
          nullable: true
          description: >-
            Git commit SHA (40-character hexadecimal). For agents: set on
            version creation. For integrations: set after code is stored in
            GitHub.
        summary:
          type: string
          maxLength: 500
          nullable: true
          description: >-
            Commit message summary. For agents: set on version creation. For
            integrations: set after code is stored in GitHub.
        tools:
          type: array
          items: {}
          nullable: true
        version_number:
          type: string
          maxLength: 100
          nullable: true
          description: >-
            The semantic version number (i.e., MAJOR.MINOR.PATCH) of this
            version
        agent: {}
        author: {}
        status: {}
        version_type: {}
    AgentVersionEphemeral:
      type: object
      properties:
        id:
          type: string
          format: uuid
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
        agent_id:
          type: string
          format: uuid
        author_id:
          type: string
          format: uuid
        files:
          type: object
          description: >-
            The files for this version and their content. Format: {[key:
            filename]: content}
        validation_status:
          type: string
          enum:
            - SKIPPED
            - PENDING
            - RUNNING
            - PASSED
            - FAILED
        dependencies:
          type: object
          nullable: true
          description: npm package.json dependencies
        description:
          type: string
          nullable: true
          description: Description for the agent extracted from the agent code.
        env_references:
          type: array
          items: {}
          nullable: true
          description: >-
            Workspace variable keys referenced as {{env.KEY}} in the version's
            prompt, extracted at build time
        input_schema:
          type: object
          nullable: true
          description: JSON Schema from Zod input
        output_schema:
          type: object
          nullable: true
          description: JSON Schema from Zod output
        raw_tools:
          type: array
          items: {}
          nullable: true
          description: >-
            Structured per-tool metadata. Each entry is a tool object
            discriminated by toolType (integration, legacy, agent, builtin).
        runtime_environment_id:
          type: string
          format: uuid
          nullable: true
        tools:
          type: array
          items: {}
          nullable: true
        version_number:
          type: string
          maxLength: 100
          nullable: true
          description: >-
            The semantic version number (i.e., MAJOR.MINOR.PATCH) of this
            version
        agent: {}
        author: {}
        published_at: {}
        publishing_started_at: {}
        sha: {}
        status: {}
        summary: {}
        version_type: {}
    Organization:
      type: object
      properties:
        id:
          type: string
          format: uuid
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
        creator_id:
          type: string
          format: uuid
          description: >-
            The user who created this organization. Note that this does not give
            that user membership.
        name:
          type: string
          maxLength: 100
          description: The unique name identifying this account.
        cached_forks_count:
          type: integer
          description: A cached version of the forks count. Might not be up to date.
        cached_forks_public_count:
          type: integer
          description: >-
            A cached version of the forks count for public agents. Might not be
            up to date.
        cached_installs_count:
          type: integer
          description: A cached version of the installs count. Might not be up to date.
        cached_installs_public_count:
          type: integer
          description: >-
            A cached version of the installs count for public agents. Might not
            be up to date.
        cached_likes_count:
          type: integer
          description: A cached version of the likes count. Might not be up to date.
        cached_likes_public_count:
          type: integer
          description: >-
            A cached version of the likes count for public agents. Might not be
            up to date.
        avatar_url:
          type: string
          maxLength: 255
          nullable: true
        banner_url:
          type: string
          maxLength: 255
          nullable: true
        bio:
          type: string
          nullable: true
        discord_url:
          type: string
          maxLength: 255
          nullable: true
        email_domain:
          type: string
          maxLength: 100
          nullable: true
          description: >-
            The email domain of the organization. Members will be automatically
            invited to this organization if they have an email with this domain.
        full_name:
          type: string
          maxLength: 100
          nullable: true
          description: The display name of the account.
        github_url:
          type: string
          maxLength: 255
          nullable: true
        linkedin_url:
          type: string
          maxLength: 255
          nullable: true
        threads_url:
          type: string
          maxLength: 255
          nullable: true
        website_url:
          type: string
          maxLength: 255
          nullable: true
        x_url:
          type: string
          maxLength: 255
          nullable: true
        youtube_url:
          type: string
          maxLength: 255
          nullable: true
        member_count: {}
        viewer_membership_id: {}
        viewer_membership_public: {}
        viewer_role:
          type: string
          enum:
            - ADMIN
            - MEMBER
          nullable: true
          description: Current viewer's role in the organization (null if not a member)
        type:
          type: string
          enum:
            - organization
          description: Account type, always "organization"
  securitySchemes:
    apiKey:
      type: http
      scheme: basic
      description: 'Account API key: key id as the username, secret as the password.'

````