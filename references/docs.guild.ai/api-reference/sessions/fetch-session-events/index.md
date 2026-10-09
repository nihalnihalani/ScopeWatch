---
source_url: https://docs.guild.ai/api-reference/sessions/fetch-session-events
source_capture: .firecrawl/runtime-guild-events.md
collection_status: reused_prior_capture
indexed_at: 2026-10-09
---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.guild.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Fetch session events

> Requires `workspaces:read` and `agents:read`. Events default to newest-first (`sort_by=-id`) with a limit of 20, so a naive read returns the tail of the conversation in reverse. For polling, pass `from_id` as an exclusive cursor (`id > from_id`) so each poll returns only what happened since the last one -- event ids are UUIDv7 and therefore time-ordered. The agent's reply arrives as a `runtime_done` event whose `content.text` carries the message; events persist when a turn completes, not while the model is streaming, so a poll during generation returns nothing new until the turn finishes.

A key missing `agents:read` currently gets a `500`, not a filtered `200` or a `403` -- serializing an agent task reads details the key isn't allowed to see, and that read fails loudly instead of being omitted. Grant `agents:read` alongside `workspaces:read` for any session that ran an agent.



## OpenAPI

````yaml /api-reference/openapi.yaml get /sessions/{session_id}/events
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
    get:
      tags:
        - sessions
      summary: Fetch session events
      description: >-
        Requires `workspaces:read` and `agents:read`. Events default to
        newest-first (`sort_by=-id`) with a limit of 20, so a naive read returns
        the tail of the conversation in reverse. For polling, pass `from_id` as
        an exclusive cursor (`id > from_id`) so each poll returns only what
        happened since the last one -- event ids are UUIDv7 and therefore
        time-ordered. The agent's reply arrives as a `runtime_done` event whose
        `content.text` carries the message; events persist when a turn
        completes, not while the model is streaming, so a poll during generation
        returns nothing new until the turn finishes.


        A key missing `agents:read` currently gets a `500`, not a filtered `200`
        or a `403` -- serializing an agent task reads details the key isn't
        allowed to see, and that read fails loudly instead of being omitted.
        Grant `agents:read` alongside `workspaces:read` for any session that ran
        an agent.
      operationId: gen_session_events
      parameters:
        - name: session_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
        - name: sort_by
          in: query
          required: false
          schema:
            default: null
            title: Sort By
            nullable: true
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
        - name: from_id
          in: query
          required: false
          schema:
            default: null
            title: From Id
            nullable: true
            type: string
        - name: types
          in: query
          required: false
          schema:
            default: null
            title: Types
            nullable: true
            type: string
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
                      $ref: '#/components/schemas/Event'
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
  securitySchemes:
    apiKey:
      type: http
      scheme: basic
      description: 'Account API key: key id as the username, secret as the password.'

````