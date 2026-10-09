> ## Documentation Index
> Fetch the complete documentation index at: https://docs.guild.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Fetch session sub-tasks

> Requires `workspaces:read` and `agents:read` -- see the note on session events above about the `500` when `agents:read` is missing.



## OpenAPI

````yaml /api-reference/openapi.yaml get /sessions/{session_id}/tasks
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
  /sessions/{session_id}/tasks:
    get:
      tags:
        - sessions
      summary: Fetch session sub-tasks
      description: >-
        Requires `workspaces:read` and `agents:read` -- see the note on session
        events above about the `500` when `agents:read` is missing.
      operationId: gen_session_tasks
      parameters:
        - name: session_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
        - name: limit
          in: query
          required: false
          schema:
            type: integer
            default: 20
            minimum: 0
            maximum: 1000
          description: Maximum number of items to return.
        - name: offset
          in: query
          required: false
          schema:
            type: integer
            default: 0
            minimum: 0
          description: Number of items to skip before returning results.
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
                      $ref: '#/components/schemas/Task'
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
    Task:
      oneOf:
        - $ref: '#/components/schemas/TaskAgent'
        - $ref: '#/components/schemas/TaskTool'
    ErrorResponse:
      type: object
      properties:
        error:
          type: string
        message:
          type: string
    TaskAgent:
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
        session_id:
          type: string
          format: uuid
        status:
          type: string
          enum:
            - CREATED
            - DISPATCHED
            - STARTED
            - RUNNING
            - WAITING
            - ERROR
            - DONE
            - INTERRUPTED
        notified_at:
          type: string
          format: date-time
          nullable: true
          description: |-
            Date and time when this task output was sent to the runtime.
                            This should be None if the task is not DONE or ERROR, or if the
                            runtime hasn't been resumed yet.
        parent_task_id:
          type: string
          format: uuid
          nullable: true
        runtime_id:
          type: string
          format: uuid
          nullable: true
          description: >-
            An optional runtime, if the agent is not run in the default Guild
            runtime.
        saved_state:
          type: string
          nullable: true
        span_id:
          nullable: true
          description: >-
            Span id of the single invoke_agent span that covers this agent task
            across all of its start/resume executions.
        trace_id:
          nullable: true
        version_id:
          type: string
          format: uuid
          nullable: true
          description: >-
            The version of the agent that this task is running. If None, it
            means we're running the assistant.
        agent: {}
        cache_read_tokens: {}
        cache_write_tokens: {}
        input_tokens: {}
        llm_call_count: {}
        output_tokens: {}
        parent_task: {}
        token_usage: {}
        total_tokens: {}
        version: {}
    TaskTool:
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
        parent_task_id:
          type: string
          format: uuid
        session_id:
          type: string
          format: uuid
        status:
          type: string
          enum:
            - CREATED
            - DISPATCHED
            - STARTED
            - RUNNING
            - WAITING
            - ERROR
            - DONE
            - INTERRUPTED
        tool_call_id:
          type: string
        tool_name:
          type: string
          maxLength: 255
        http_status_code:
          type: integer
          nullable: true
          description: The HTTP response code of the response
        notified_at:
          type: string
          format: date-time
          nullable: true
          description: |-
            Date and time when this task output was sent to the runtime.
                            This should be None if the task is not DONE or ERROR, or if the
                            runtime hasn't been resumed yet.
        request_bytes:
          type: integer
          nullable: true
          description: The number of bytes in the outgoing request
        response_bytes:
          type: integer
          nullable: true
          description: The number of bytes in the response
        response_data:
          type: string
          nullable: true
          description: >-
            Full JSON response body, stored only when the response was projected
            due to size
        parent_task: {}
        token_usage: {}
  securitySchemes:
    apiKey:
      type: http
      scheme: basic
      description: 'Account API key: key id as the username, secret as the password.'

````