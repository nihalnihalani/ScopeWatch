> ## Documentation Index
> Fetch the complete documentation index at: https://docs.guild.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Post a follow-up event to a session

> Requires `sessions:write`. The message is authored by the key itself (`author.type: "api_key"`) -- a key may never author as anyone else. The `agent_id` field is accepted but ignored for a key, so a key cannot switch which agent answers mid-conversation; start a new session instead. A key converses only in the chat sessions it initiated -- posting into any other session (another key's chat, a person's chat, a trigger session) is `404`.



## OpenAPI

````yaml /api-reference/openapi.yaml post /sessions/{session_id}/events
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
  /sessions/{session_id}/events:
    post:
      tags:
        - sessions
      summary: Post a follow-up event to a session
      description: >-
        Requires `sessions:write`. The message is authored by the key itself
        (`author.type: "api_key"`) -- a key may never author as anyone else. The
        `agent_id` field is accepted but ignored for a key, so a key cannot
        switch which agent answers mid-conversation; start a new session
        instead. A key converses only in the chat sessions it initiated --
        posting into any other session (another key's chat, a person's chat, a
        trigger session) is `404`.
      operationId: create_session_event
      parameters:
        - name: session_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: false
        content:
          application/json:
            schema:
              anyOf:
                - $ref: '#/components/schemas/CreateTextSessionEventInput'
                - $ref: '#/components/schemas/CreateJsonSessionEventInput'
                - $ref: '#/components/schemas/CreateMultimodalSessionEventInput'
                - $ref: '#/components/schemas/CreateMultipartSessionEventInput'
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Event'
        '400':
          description: Bad Request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '403':
          description: Forbidden
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
      security:
        - apiKey: []
components:
  schemas:
    CreateTextSessionEventInput:
      properties:
        agent_id:
          default: null
          title: Agent Id
          nullable: true
          type: string
        selected_skills:
          default: null
          title: Selected Skills
          nullable: true
          items:
            type: string
          type: array
        content:
          title: Content
          type: string
        mode:
          default: text
          title: Mode
          type: string
          enum:
            - text
      required:
        - content
      title: CreateTextSessionEventInput
      type: object
    CreateJsonSessionEventInput:
      properties:
        agent_id:
          default: null
          title: Agent Id
          nullable: true
          type: string
        selected_skills:
          default: null
          title: Selected Skills
          nullable: true
          items:
            type: string
          type: array
        content:
          additionalProperties: true
          title: Content
          type: object
        mode:
          title: Mode
          type: string
          enum:
            - json
      required:
        - content
        - mode
      title: CreateJsonSessionEventInput
      type: object
    CreateMultimodalSessionEventInput:
      properties:
        agent_id:
          default: null
          title: Agent Id
          nullable: true
          type: string
        selected_skills:
          default: null
          title: Selected Skills
          nullable: true
          items:
            type: string
          type: array
        content:
          items:
            $ref: '#/components/schemas/_MultimodalContentPart'
          minItems: 1
          title: Content
          type: array
        mode:
          title: Mode
          type: string
          enum:
            - multimodal
      required:
        - content
        - mode
      title: CreateMultimodalSessionEventInput
      type: object
    CreateMultipartSessionEventInput:
      properties:
        agent_id:
          default: null
          title: Agent Id
          nullable: true
          type: string
        selected_skills:
          default: null
          title: Selected Skills
          nullable: true
          items:
            type: string
          type: array
        content:
          additionalProperties: true
          title: Content
          type: object
        mode:
          title: Mode
          type: string
          enum:
            - multipart
      required:
        - content
        - mode
      title: CreateMultipartSessionEventInput
      type: object
    Event:
      oneOf:
        - $ref: '#/components/schemas/EventContainerLog'
        - $ref: '#/components/schemas/EventAgentConsole'
        - $ref: '#/components/schemas/EventAgentInstallRequest'
        - $ref: '#/components/schemas/EventAgentNotificationError'
        - $ref: '#/components/schemas/EventAgentNotificationMessage'
        - $ref: '#/components/schemas/EventAgentNotificationProgress'
        - $ref: '#/components/schemas/EventCredentialsRequest'
        - $ref: '#/components/schemas/EventInterrupted'
        - $ref: '#/components/schemas/EventLlmDone'
        - $ref: '#/components/schemas/EventLlmStart'
        - $ref: '#/components/schemas/EventRuntimeDone'
        - $ref: '#/components/schemas/EventRuntimeError'
        - $ref: '#/components/schemas/EventRuntimeRunning'
        - $ref: '#/components/schemas/EventRuntimeStart'
        - $ref: '#/components/schemas/EventRuntimeWaiting'
        - $ref: '#/components/schemas/EventSecurity'
        - $ref: '#/components/schemas/EventSystemError'
        - $ref: '#/components/schemas/EventSystemMessage'
        - $ref: '#/components/schemas/EventTriggerMessage'
        - $ref: '#/components/schemas/EventUserMessage'
    ErrorResponse:
      type: object
      properties:
        error:
          type: string
        message:
          type: string
    _MultimodalContentPart:
      discriminator:
        mapping:
          file: '#/components/schemas/_AttachmentContentPart'
          image: '#/components/schemas/_AttachmentContentPart'
          text: '#/components/schemas/_TextContentPart'
        propertyName: type
      oneOf:
        - $ref: '#/components/schemas/_TextContentPart'
        - $ref: '#/components/schemas/_AttachmentContentPart'
    EventContainerLog:
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
        task_id:
          type: string
          format: uuid
        level:
          type: string
          enum:
            - INFO
            - ERROR
          nullable: true
          description: >-
            Severity of the line: INFO for ordinary output, ERROR for
            error-level output. Nullable for now; pre-existing rows have no
            level.
        message:
          type: string
        timestamp:
          type: string
          format: date-time
          description: When the line was produced in the container (not received)
        type: {}
    EventAgentConsole:
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
        content:
          type: string
        level:
          type: string
          enum:
            - DEBUG
            - INFO
            - WARN
            - ERROR
        task_id:
          type: string
          format: uuid
        type: {}
    EventAgentInstallRequest:
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
        requested_agent_id:
          type: string
          format: uuid
          description: The agent requested to be installed
        task_id:
          type: string
          format: uuid
        installed_agent_id:
          type: string
          format: uuid
          nullable: true
          description: The workspace agent created when this request was fulfilled
        processed_at:
          type: string
          format: date-time
          nullable: true
          description: If the request has been declined, this is when it happened.
        processed_by_id:
          type: string
          format: uuid
          nullable: true
          description: The user who declined or accepted this request, if applicable.
        agent: {}
        installed_agent: {}
        is_fulfilled: {}
        requested_agent: {}
        type: {}
    EventAgentNotificationError:
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
        content:
          type: object
        task_id:
          type: string
          format: uuid
        data: {}
        type: {}
    EventAgentNotificationMessage:
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
        content:
          type: object
        task_id:
          type: string
          format: uuid
        type: {}
    EventAgentNotificationProgress:
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
        content:
          type: object
        task_id:
          type: string
          format: uuid
        type: {}
    EventCredentialsRequest:
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
        auth_config_id:
          type: string
          format: uuid
          description: The auth config this credentials should use
        task_id:
          type: string
          format: uuid
        is_fulfilled:
          type: boolean
          description: >-
            Indicates whether the request has been fulfilled. Skipped requests
            are also marked fulfilled (see skipped_at). If it is set to true,
            credentials is null, and skipped_at is null, it means the
            credentials has been deleted later.
        credentials_id:
          type: string
          format: uuid
          nullable: true
          description: The credentials created when this request was fulfilled
        skipped_at:
          type: string
          format: date-time
          nullable: true
          description: If the request was skipped, when it happened.
        skipped_by_id:
          type: string
          format: uuid
          nullable: true
          description: The user who skipped this request, if applicable.
        target_account_id:
          type: string
          format: uuid
          nullable: true
          description: >-
            The account the credentials should be installed in, if applicable.
            This is used by The Smith to request installs in other accounts.
        agent: {}
        integration: {}
        target_account: {}
        type: {}
    EventInterrupted:
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
        interrupted_at:
          type: string
          format: date-time
          description: Timestamp when the session was interrupted
        interrupted_by_id:
          type: string
          format: uuid
          description: User who interrupted the session
        task_id:
          type: string
          format: uuid
        interrupted_by: {}
        type: {}
    EventLlmDone:
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
        body:
          type: string
        headers:
          type: object
        llm_event_id:
          type: string
          format: uuid
        status_code:
          type: integer
        task_id:
          type: string
          format: uuid
        type: {}
    EventLlmStart:
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
        headers:
          type: object
        inference_provider_id:
          type: string
          format: uuid
        llm_provider:
          type: string
          enum:
            - ANTHROPIC
            - OPENAI
            - GEMINI
            - FAKE_LLM
            - META
        payload:
          type: object
        task_id:
          type: string
          format: uuid
        llm_model:
          type: string
          maxLength: 100
          nullable: true
        model: {}
        provider: {}
        type: {}
    EventRuntimeDone:
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
        content:
          type: object
        task_id:
          type: string
          format: uuid
        type: {}
    EventRuntimeError:
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
        content:
          type: string
        task_id:
          type: string
          format: uuid
        stack:
          type: string
          nullable: true
        type: {}
    EventRuntimeRunning:
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
        task_id:
          type: string
          format: uuid
        type: {}
    EventRuntimeStart:
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
        content:
          type: object
        task_id:
          type: string
          format: uuid
        type: {}
    EventRuntimeWaiting:
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
        task_id:
          type: string
          format: uuid
        type: {}
    EventSecurity:
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
        decision:
          type: string
          enum:
            - ALLOW
            - DENY
            - ERROR
          description: Security decision outcome.
        message:
          type: string
          description: Human-readable security event summary.
        operation:
          type: string
          maxLength: 255
          description: Integration operation or action evaluated.
        reason_code:
          type: string
          enum:
            - POLICY_DENIED
            - CREDENTIAL_UNAVAILABLE
            - PRIVILEGE_ESCALATION_DENIED
            - PLATFORM_ACCESS_DENIED
            - ACCESS_ALLOWED
          description: Stable machine code for why the decision occurred.
        task_id:
          type: string
          format: uuid
        acting_user_id:
          type: string
          format: uuid
          nullable: true
          description: Human acting on behalf of the task when the decision was recorded.
        capability:
          type: string
          maxLength: 32
          nullable: true
          description: Capability evaluated for this decision (read, write, delete, admin).
        credentials_id:
          type: string
          format: uuid
          nullable: true
          description: Credentials involved in the security decision when applicable.
        details:
          type: object
          nullable: true
          description: Optional structured audit context beyond task/session links.
        acting_user: {}
        credentials: {}
        integration: {}
        task: {}
        type: {}
    EventSystemError:
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
        details:
          type: object
          description: An arbitrary JSON object that stores details about the error.
        message:
          type: string
          description: A user-visible message that describes the error that occurred.
        task_id:
          type: string
          format: uuid
        content: {}
        data: {}
        type: {}
    EventSystemMessage:
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
        content:
          type: object
        task_id:
          type: string
          format: uuid
        data: {}
        type: {}
    EventTriggerMessage:
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
        content:
          type: object
        task_id:
          type: string
          format: uuid
        data: {}
        type: {}
    EventUserMessage:
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
        author_id:
          type: string
          format: uuid
          description: >-
            Who sent this message: a user, or an account API key relaying a
            conversation on behalf of its account.
        content:
          type: array
          items: {}
        task_id:
          type: string
          format: uuid
        author: {}
        content_parts: {}
        type: {}
    _AttachmentContentPart:
      properties:
        type:
          enum:
            - image
            - file
          title: Type
          type: string
        attachment_id:
          format: uuid
          title: Attachment Id
          type: string
      required:
        - type
        - attachment_id
      title: _AttachmentContentPart
      type: object
    _TextContentPart:
      properties:
        type:
          title: Type
          type: string
          enum:
            - text
        text:
          title: Text
          type: string
      required:
        - type
        - text
      title: _TextContentPart
      type: object
  securitySchemes:
    apiKey:
      type: http
      scheme: basic
      description: 'Account API key: key id as the username, secret as the password.'

````