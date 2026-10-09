> ## Documentation Index
> Fetch the complete documentation index at: https://docs.guild.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Start a session in a workspace

> Requires `sessions:write` on a workspace the key's account owns. `chat` is the only `session_type` a key may create -- `time`, `webhook`, `api_trigger`, and `agent_test` sessions are a `403`. The key is recorded as the session's `initiator` (serialized `type: "api_key"`), and the agent begins executing `initial_prompt` immediately.



## OpenAPI

````yaml /api-reference/openapi.yaml post /workspaces/{workspace_id_or_name}/sessions
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
  /workspaces/{workspace_id_or_name}/sessions:
    post:
      tags:
        - workspaces
      summary: Start a session in a workspace
      description: >-
        Requires `sessions:write` on a workspace the key's account owns. `chat`
        is the only `session_type` a key may create -- `time`, `webhook`,
        `api_trigger`, and `agent_test` sessions are a `403`. The key is
        recorded as the session's `initiator` (serialized `type: "api_key"`),
        and the agent begins executing `initial_prompt` immediately.
      operationId: create_workspace_session
      parameters:
        - name: workspace_id_or_name
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - session_type
                - agent_id
                - initial_prompt
              properties:
                session_type:
                  type: string
                  enum:
                    - chat
                  description: The only value a key may pass.
                agent_id:
                  type: string
                  format: uuid
                initial_prompt:
                  type: string
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Session'
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
    Session:
      oneOf:
        - $ref: '#/components/schemas/SessionAgentTest'
        - $ref: '#/components/schemas/SessionChat'
        - $ref: '#/components/schemas/SessionTriggerApi'
        - $ref: '#/components/schemas/SessionTriggerTime'
        - $ref: '#/components/schemas/SessionTriggerWebhook'
    ErrorResponse:
      type: object
      properties:
        error:
          type: string
        message:
          type: string
    SessionAgentTest:
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
        initiator_id:
          type: string
          format: uuid
          description: The user who started this agent test session.
        test_type:
          type: string
          enum:
            - MANUAL
            - EVAL
          description: >-
            Eval trials run as agent-test sessions; this separates them from
            sessions a person started from the agent editor.
        version_override_id:
          type: string
          format: uuid
          description: The specific agent version being tested in this session.
        workspace_id:
          type: string
          format: uuid
          description: The workspace this session belongs to.
        context_id:
          type: string
          format: uuid
          nullable: true
          description: The context used in this session, if available.
        context_override_id:
          type: string
          format: uuid
          nullable: true
          description: Optional context override for testing purposes.
        interrupted_at:
          type: string
          format: date-time
          nullable: true
          description: >-
            Timestamp when this session was interrupted by a user. If set, no
            new messages can be sent and tasks cannot be executed.
        interrupted_by_id:
          type: string
          format: uuid
          nullable: true
          description: User who interrupted this session.
        seed_context:
          type: string
          nullable: true
          description: >-
            Optional hidden pre-seed text for this session only, prepended to
            the agent's context on the first turn (e.g. the onboarding handoff
            tour transcript). Not a workspace context.
    SessionChat:
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
        initiator_id:
          type: string
          format: uuid
          description: >-
            Who started this chat session: a user, or an account API key acting
            as its account.
        workspace_id:
          type: string
          format: uuid
          description: The workspace this session belongs to.
        archived_at:
          type: string
          format: date-time
          nullable: true
        archived_by_id:
          type: string
          format: uuid
          nullable: true
        assistant_version_id:
          type: string
          format: uuid
          nullable: true
          description: >-
            The assistant version resolved for this chat session. Null for
            legacy sessions and direct agent sessions that did not use the
            assistant.
        context_id:
          type: string
          format: uuid
          nullable: true
          description: The context used in this session, if available.
        interrupted_at:
          type: string
          format: date-time
          nullable: true
          description: >-
            Timestamp when this session was interrupted by a user. If set, no
            new messages can be sent and tasks cannot be executed.
        interrupted_by_id:
          type: string
          format: uuid
          nullable: true
          description: User who interrupted this session.
        name:
          type: string
          maxLength: 100
          nullable: true
          description: >-
            The name/title of this chat session. Usually generated by an LLM
            based on the first prompt.
        seed_context:
          type: string
          nullable: true
          description: >-
            Optional hidden pre-seed text for this session only, prepended to
            the agent's context on the first turn (e.g. the onboarding handoff
            tour transcript). Not a workspace context.
    SessionTriggerApi:
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
        api_key_id:
          type: string
          format: uuid
          description: The API key which initiated this session.
        ip_address:
          type: string
          maxLength: 45
          description: The IP address of the client which initiated this session.
        trigger_id:
          type: string
          format: uuid
          description: The trigger that initiated this session.
        workspace_id:
          type: string
          format: uuid
          description: The workspace this session belongs to.
        context_id:
          type: string
          format: uuid
          nullable: true
          description: The context used in this session, if available.
        interrupted_at:
          type: string
          format: date-time
          nullable: true
          description: >-
            Timestamp when this session was interrupted by a user. If set, no
            new messages can be sent and tasks cannot be executed.
        interrupted_by_id:
          type: string
          format: uuid
          nullable: true
          description: User who interrupted this session.
        seed_context:
          type: string
          nullable: true
          description: >-
            Optional hidden pre-seed text for this session only, prepended to
            the agent's context on the first turn (e.g. the onboarding handoff
            tour transcript). Not a workspace context.
        session_type: {}
        trigger: {}
    SessionTriggerTime:
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
        trigger_id:
          type: string
          format: uuid
          description: The trigger that initiated this session.
        workspace_id:
          type: string
          format: uuid
          description: The workspace this session belongs to.
        context_id:
          type: string
          format: uuid
          nullable: true
          description: The context used in this session, if available.
        interrupted_at:
          type: string
          format: date-time
          nullable: true
          description: >-
            Timestamp when this session was interrupted by a user. If set, no
            new messages can be sent and tasks cannot be executed.
        interrupted_by_id:
          type: string
          format: uuid
          nullable: true
          description: User who interrupted this session.
        seed_context:
          type: string
          nullable: true
          description: >-
            Optional hidden pre-seed text for this session only, prepended to
            the agent's context on the first turn (e.g. the onboarding handoff
            tour transcript). Not a workspace context.
    SessionTriggerWebhook:
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
        integration_webhook_id:
          type: string
          format: uuid
          description: The webhook that triggered this session.
        trigger_id:
          type: string
          format: uuid
          description: The webhook trigger that initiated this session.
        workspace_id:
          type: string
          format: uuid
          description: The workspace this session belongs to.
        context_id:
          type: string
          format: uuid
          nullable: true
          description: The context used in this session, if available.
        interrupted_at:
          type: string
          format: date-time
          nullable: true
          description: >-
            Timestamp when this session was interrupted by a user. If set, no
            new messages can be sent and tasks cannot be executed.
        interrupted_by_id:
          type: string
          format: uuid
          nullable: true
          description: User who interrupted this session.
        remote_id:
          type: string
          maxLength: 255
          nullable: true
          description: Remote identifier for correlating related events to this session.
        seed_context:
          type: string
          nullable: true
          description: >-
            Optional hidden pre-seed text for this session only, prepended to
            the agent's context on the first turn (e.g. the onboarding handoff
            tour transcript). Not a workspace context.
  securitySchemes:
    apiKey:
      type: http
      scheme: basic
      description: 'Account API key: key id as the username, secret as the password.'

````