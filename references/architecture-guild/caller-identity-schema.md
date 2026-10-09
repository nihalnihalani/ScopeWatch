> ## Documentation Index
> Fetch the complete documentation index at: https://docs.guild.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Identify the calling key

> Returns the identity of the API key making the request: the account it acts as, the key's id, and the key's scopes. Requires only a valid key; no scope is needed.



## OpenAPI

````yaml /api-reference/openapi.yaml get /me
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
  /me:
    get:
      tags:
        - accounts
      summary: Identify the calling key
      description: >-
        Returns the identity of the API key making the request: the account it
        acts as, the key's id, and the key's scopes. Requires only a valid key;
        no scope is needed.
      operationId: get_me
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Me'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
      security:
        - apiKey: []
components:
  schemas:
    Me:
      type: object
      properties:
        key_id:
          type: string
          format: uuid
          description: The id of the API key making the request.
        account:
          $ref: '#/components/schemas/Account'
        scopes:
          type: array
          items:
            type: string
          description: The scopes granted to the key, as `<group>:<access>` strings.
      required:
        - key_id
        - account
        - scopes
      title: Me
    ErrorResponse:
      type: object
      properties:
        error:
          type: string
        message:
          type: string
    Account:
      oneOf:
        - $ref: '#/components/schemas/Organization'
        - $ref: '#/components/schemas/User'
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
  securitySchemes:
    apiKey:
      type: http
      scheme: basic
      description: 'Account API key: key id as the username, secret as the password.'

````