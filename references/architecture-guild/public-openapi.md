openapi: 3.0.3
info:
 title: Guild Public API
 version: 1.0.0
 description: The Guild public API, served at https://api.guild.ai/v1 and authenticated
 with account API keys (HTTP Basic, key id as the username and the secret as the
 password). See https://docs.guild.ai/api-reference/introduction#scopes for scopes
 and behavior. A session-events websocket also exists at wss://api.guild.ai/v1/sessions/{session\_id}/events/ws
 with the same Basic auth on the handshake; OpenAPI cannot describe websockets,
 so it is not listed in paths.
servers:
\- url: https://api.guild.ai/v1
 description: Production
tags:
\- name: accounts
\- name: agents
\- name: other
\- name: sessions
\- name: skills
\- name: workspaces
paths:
 /accounts/{account\_id\_or\_name}/skills:
 get:
 operationId: get\_account\_skills
 tags:
 \- accounts
 security:
 \- apiKey: \[\]
 parameters:
 \- name: account\_id\_or\_name
 in: path
 required: true
 schema:
 type: string
 \- name: sort\_by
 in: query
 required: false
 schema:
 default: null
 description: Column name to sort by; prefix with '-' for descending order.
 title: Sort By
 nullable: true
 type: string
 \- name: limit
 in: query
 required: false
 schema:
 default: 20
 description: Maximum number of items to return.
 maximum: 1000
 minimum: 0
 title: Limit
 type: integer
 \- name: offset
 in: query
 required: false
 schema:
 default: 0
 description: Number of items to skip before returning results.
 maximum: 9223372036854775807
 minimum: 0
 title: Offset
 type: integer
 \- name: search
 in: query
 required: false
 schema:
 default: null
 title: Search
 nullable: true
 type: string
 \- name: archived
 in: query
 required: false
 schema:
 default: null
 title: Archived
 nullable: true
 type: boolean
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
 $ref: '#/components/schemas/Skill'
 pagination:
 type: object
 properties:
 total\_count:
 type: integer
 limit:
 type: integer
 offset:
 type: integer
 has\_more:
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
 post:
 operationId: create\_account\_skill
 tags:
 \- accounts
 security:
 \- apiKey: \[\]
 parameters:
 \- name: account\_id\_or\_name
 in: path
 required: true
 schema:
 type: string
 requestBody:
 required: true
 content:
 application/json:
 schema:
 properties:
 name:
 title: Name
 type: string
 overview:
 default: null
 title: Overview
 nullable: true
 type: string
 is\_public:
 default: false
 title: Is Public
 type: boolean
 avatar\_url:
 default: null
 title: Avatar Url
 nullable: true
 type: string
 required:
 \- name
 title: CreateAccountSkillInput
 type: object
 responses:
 '201':
 description: Successful response
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/Skill'
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
 '400':
 description: Bad Request
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/ErrorResponse'
 /accounts/{account\_id\_or\_name}/workspaces:
 get:
 operationId: get\_account\_workspaces
 tags:
 \- accounts
 security:
 \- apiKey: \[\]
 parameters:
 \- name: account\_id\_or\_name
 in: path
 required: true
 schema:
 type: string
 \- name: sort\_by
 in: query
 required: false
 schema:
 default: null
 description: Column name to sort by; prefix with '-' for descending order.
 title: Sort By
 nullable: true
 type: string
 \- name: limit
 in: query
 required: false
 schema:
 default: 20
 description: Maximum number of items to return.
 maximum: 1000
 minimum: 0
 title: Limit
 type: integer
 \- name: offset
 in: query
 required: false
 schema:
 default: 0
 description: Number of items to skip before returning results.
 maximum: 9223372036854775807
 minimum: 0
 title: Offset
 type: integer
 \- name: archived
 in: query
 required: false
 schema:
 default: null
 title: Archived
 nullable: true
 type: boolean
 \- name: filter
 in: query
 required: false
 schema:
 default: null
 title: Filter
 nullable: true
 type: string
 \- name: search
 in: query
 required: false
 schema:
 default: null
 title: Search
 nullable: true
 type: string
 responses:
 '200':
 description: Successful response
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/WorkspaceList'
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
 x-guild-response-model: WorkspaceList
 /agents:
 get:
 operationId: list\_agents
 tags:
 \- agents
 parameters:
 \- name: sort\_by
 in: query
 required: false
 schema:
 default: null
 description: Column name to sort by; prefix with '-' for descending order.
 title: Sort By
 nullable: true
 type: string
 \- name: limit
 in: query
 required: false
 schema:
 default: 20
 description: Maximum number of items to return.
 maximum: 1000
 minimum: 0
 title: Limit
 type: integer
 \- name: offset
 in: query
 required: false
 schema:
 default: 0
 description: Number of items to skip before returning results.
 maximum: 9223372036854775807
 minimum: 0
 title: Offset
 type: integer
 \- name: search
 in: query
 required: false
 schema:
 default: null
 title: Search
 nullable: true
 type: string
 \- name: fast
 in: query
 required: false
 schema:
 default: false
 title: Fast
 type: boolean
 \- name: published\_only
 in: query
 required: false
 schema:
 default: false
 title: Published Only
 type: boolean
 \- name: is\_public
 in: query
 required: false
 schema:
 default: false
 title: Is Public
 type: boolean
 \- name: is\_pinned
 in: query
 required: false
 schema:
 default: null
 title: Is Pinned
 nullable: true
 type: boolean
 \- name: for\_workspace
 in: query
 required: false
 schema:
 default: null
 title: For Workspace
 nullable: true
 type: string
 \- name: tags
 in: query
 required: false
 schema:
 default: null
 title: Tags
 nullable: true
 type: string
 \- name: categories
 in: query
 required: false
 schema:
 default: null
 title: Categories
 nullable: true
 type: string
 \- name: agent\_types
 in: query
 required: false
 schema:
 default: null
 title: Agent Types
 nullable: true
 type: string
 \- name: owner
 in: query
 required: false
 schema:
 default: null
 title: Owner
 nullable: true
 type: string
 \- name: contributor
 in: query
 required: false
 schema:
 default: null
 title: Contributor
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
 $ref: '#/components/schemas/Agent'
 pagination:
 type: object
 properties:
 total\_count:
 type: integer
 limit:
 type: integer
 offset:
 type: integer
 has\_more:
 type: boolean
 '401':
 description: Unauthorized
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/ErrorResponse'
 post:
 operationId: create\_agent
 tags:
 \- agents
 security:
 \- apiKey: \[\]
 requestBody:
 required: true
 content:
 application/json:
 schema:
 properties:
 name:
 title: Name
 type: string
 description:
 default: null
 title: Description
 nullable: true
 type: string
 is\_public:
 default: false
 title: Is Public
 type: boolean
 avatar\_url:
 default: null
 title: Avatar Url
 nullable: true
 type: string
 owner\_id:
 default: null
 title: Owner Id
 nullable: true
 type: string
 maintainer\_id:
 default: null
 title: Maintainer Id
 nullable: true
 format: uuid
 type: string
 category:
 default: null
 title: Category
 nullable: true
 type: string
 tags:
 default: null
 title: Tags
 nullable: true
 items:
 type: string
 type: array
 forked\_from\_version:
 default: null
 title: Forked From Version
 nullable: true
 format: uuid
 type: string
 template:
 default: null
 nullable: true
 enum:
 \- LLM
 \- AUTO\_MANAGED\_STATE
 \- BLANK
 \- GOOSE
 \- GUILD\_NATIVE
 \- OPENCLAW
 \- LANGGRAPH
 \- ADK
 title: AgentCreationTemplate
 type: string
 required:
 \- name
 title: CreateAgentInput
 type: object
 responses:
 '200':
 description: Successful response
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/Agent'
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
 '400':
 description: Bad Request
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/ErrorResponse'
 /agents/{agent\_id\_or\_name}:
 get:
 operationId: get\_agent
 tags:
 \- agents
 parameters:
 \- name: agent\_id\_or\_name
 in: path
 required: true
 schema:
 type: string
 responses:
 '200':
 description: Successful response
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/Agent'
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
 /agents/{agent\_id\_or\_name}/configure-llm:
 post:
 operationId: configure\_agent\_llm
 tags:
 \- agents
 security:
 \- apiKey: \[\]
 parameters:
 \- name: agent\_id\_or\_name
 in: path
 required: true
 schema:
 type: string
 requestBody:
 required: true
 content:
 application/json:
 schema:
 properties:
 system\_prompt:
 title: System Prompt
 type: string
 description:
 title: Description
 type: string
 tools:
 items:
 $ref: '#/components/schemas/ConfigureLlmIntegrationToolsInput'
 title: Tools
 type: array
 guild\_tools:
 default: \[\]
 items:
 type: string
 title: Guild Tools
 type: array
 mode:
 default: one-shot
 enum:
 \- one-shot
 \- multi-turn
 title: Mode
 type: string
 summary:
 default: null
 title: Summary
 nullable: true
 type: string
 version\_number:
 default: 1.0.0
 title: Version Number
 type: string
 required:
 \- system\_prompt
 \- description
 \- tools
 title: ConfigureAgentLlmInput
 type: object
 responses:
 '200':
 description: Successful response
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/AgentVersion'
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
 '400':
 description: Bad Request
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/ErrorResponse'
 /agents/{agent\_id\_or\_name}/versions:
 get:
 operationId: list\_agent\_versions
 tags:
 \- agents
 parameters:
 \- name: agent\_id\_or\_name
 in: path
 required: true
 schema:
 type: string
 \- name: limit
 in: query
 required: false
 schema:
 default: 20
 description: Maximum number of items to return.
 maximum: 1000
 minimum: 0
 title: Limit
 type: integer
 \- name: offset
 in: query
 required: false
 schema:
 default: 0
 description: Number of items to skip before returning results.
 maximum: 9223372036854775807
 minimum: 0
 title: Offset
 type: integer
 \- name: type
 in: query
 required: false
 schema:
 default: null
 nullable: true
 enum:
 \- EPHEMERAL
 \- COMMITTED
 title: AgentVersionType
 type: string
 \- name: statuses
 in: query
 required: false
 schema:
 default: null
 title: Statuses
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
 $ref: '#/components/schemas/AgentVersion'
 pagination:
 type: object
 properties:
 total\_count:
 type: integer
 limit:
 type: integer
 offset:
 type: integer
 has\_more:
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
 post:
 operationId: create\_agent\_version
 tags:
 \- agents
 security:
 \- apiKey: \[\]
 parameters:
 \- name: agent\_id\_or\_name
 in: path
 required: true
 schema:
 type: string
 requestBody:
 required: true
 content:
 application/json:
 schema:
 properties:
 version\_type:
 $ref: '#/components/schemas/AgentVersionType'
 skip\_validation:
 default: false
 title: Skip Validation
 type: boolean
 publish:
 default: false
 title: Publish
 type: boolean
 files:
 default: null
 title: Files
 nullable: true
 items:
 $ref: '#/components/schemas/AgentVersionFile'
 type: array
 bundle:
 default: null
 title: Bundle
 nullable: true
 type: string
 encoding:
 default: null
 title: Encoding
 nullable: true
 type: string
 commit\_sha:
 default: null
 title: Commit Sha
 nullable: true
 type: string
 summary:
 default: null
 title: Summary
 nullable: true
 type: string
 version\_number:
 default: null
 title: Version Number
 nullable: true
 type: string
 required:
 \- version\_type
 title: CreateAgentVersionInput
 type: object
 responses:
 '200':
 description: Successful response
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/AgentVersion'
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
 '400':
 description: Bad Request
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/ErrorResponse'
 /me:
 get:
 operationId: get\_public\_me
 tags:
 \- other
 security:
 \- apiKey: \[\]
 responses:
 '200':
 description: Successful response
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/PublicMe'
 '401':
 description: Unauthorized
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/ErrorResponse'
 x-guild-response-model: PublicMe
 /oauth/authorize:
 get:
 operationId: oauth\_authorize\_entry
 tags:
 \- other
 responses:
 '200':
 description: Successful response
 content:
 application/json:
 schema:
 type: object
 '401':
 description: Unauthorized
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/ErrorResponse'
 /oauth/register:
 post:
 operationId: oauth\_register
 tags:
 \- other
 requestBody:
 required: true
 content:
 application/json:
 schema:
 description: 'The RFC 7591 fields this server honors; any others a client
 sends are

 ignored, as the RFC allows.'
 properties:
 client\_name:
 maxLength: 128
 minLength: 1
 title: Client Name
 type: string
 redirect\_uris:
 items:
 type: string
 maxItems: 5
 minItems: 1
 title: Redirect Uris
 type: array
 token\_endpoint\_auth\_method:
 default: none
 title: Token Endpoint Auth Method
 type: string
 enum:
 \- none
 grant\_types:
 default:
 \- authorization\_code
 \- refresh\_token
 items:
 enum:
 \- authorization\_code
 \- refresh\_token
 type: string
 title: Grant Types
 type: array
 response\_types:
 default:
 \- code
 items:
 type: string
 enum:
 \- code
 title: Response Types
 type: array
 required:
 \- client\_name
 \- redirect\_uris
 title: RegisterClientInput
 type: object
 responses:
 '201':
 description: Successful response
 content:
 application/json:
 schema:
 type: object
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
 '400':
 description: Bad Request
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/ErrorResponse'
 /oauth/token:
 post:
 operationId: oauth\_token
 tags:
 \- other
 responses:
 '200':
 description: Successful response
 content:
 application/json:
 schema:
 type: object
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
 '400':
 description: Bad Request
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/ErrorResponse'
 /sessions/{session\_id}:
 get:
 operationId: gen\_session
 tags:
 \- sessions
 security:
 \- apiKey: \[\]
 parameters:
 \- name: session\_id
 in: path
 required: true
 schema:
 type: string
 format: uuid
 responses:
 '200':
 description: Successful response
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/Session'
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
 /sessions/{session\_id}/events:
 get:
 operationId: gen\_session\_events
 tags:
 \- sessions
 security:
 \- apiKey: \[\]
 parameters:
 \- name: session\_id
 in: path
 required: true
 schema:
 type: string
 format: uuid
 \- name: sort\_by
 in: query
 required: false
 schema:
 default: null
 description: Column name to sort by; prefix with '-' for descending order.
 title: Sort By
 nullable: true
 type: string
 \- name: limit
 in: query
 required: false
 schema:
 default: 20
 description: Maximum number of items to return.
 maximum: 1000
 minimum: 0
 title: Limit
 type: integer
 \- name: offset
 in: query
 required: false
 schema:
 default: 0
 description: Number of items to skip before returning results.
 maximum: 9223372036854775807
 minimum: 0
 title: Offset
 type: integer
 \- name: from\_id
 in: query
 required: false
 schema:
 default: null
 title: From Id
 nullable: true
 type: string
 \- name: types
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
 total\_count:
 type: integer
 limit:
 type: integer
 offset:
 type: integer
 has\_more:
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
 post:
 operationId: create\_session\_event
 tags:
 \- sessions
 security:
 \- apiKey: \[\]
 parameters:
 \- name: session\_id
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
 \- $ref: '#/components/schemas/CreateTextSessionEventInput'
 \- $ref: '#/components/schemas/CreateJsonSessionEventInput'
 \- $ref: '#/components/schemas/CreateMultimodalSessionEventInput'
 \- $ref: '#/components/schemas/CreateMultipartSessionEventInput'
 responses:
 '200':
 description: Successful response
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/Event'
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
 '400':
 description: Bad Request
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/ErrorResponse'
 /sessions/{session\_id}/runtimes:
 get:
 operationId: get\_session\_runtimes
 tags:
 \- sessions
 security:
 \- apiKey: \[\]
 parameters:
 \- name: session\_id
 in: path
 required: true
 schema:
 type: string
 format: uuid
 \- name: limit
 in: query
 required: false
 schema:
 default: 20
 description: Maximum number of items to return.
 maximum: 1000
 minimum: 0
 title: Limit
 type: integer
 \- name: offset
 in: query
 required: false
 schema:
 default: 0
 description: Number of items to skip before returning results.
 maximum: 9223372036854775807
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
 $ref: '#/components/schemas/RuntimeContainer'
 pagination:
 type: object
 properties:
 total\_count:
 type: integer
 limit:
 type: integer
 offset:
 type: integer
 has\_more:
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
 /sessions/{session\_id}/tasks:
 get:
 operationId: gen\_session\_tasks
 tags:
 \- sessions
 security:
 \- apiKey: \[\]
 parameters:
 \- name: session\_id
 in: path
 required: true
 schema:
 type: string
 format: uuid
 \- name: limit
 in: query
 required: false
 schema:
 default: 20
 description: Maximum number of items to return.
 maximum: 1000
 minimum: 0
 title: Limit
 type: integer
 \- name: offset
 in: query
 required: false
 schema:
 default: 0
 description: Number of items to skip before returning results.
 maximum: 9223372036854775807
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
 $ref: '#/components/schemas/Task'
 pagination:
 type: object
 properties:
 total\_count:
 type: integer
 limit:
 type: integer
 offset:
 type: integer
 has\_more:
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
 /skills/{skill\_id\_or\_name}:
 get:
 operationId: get\_skill
 tags:
 \- skills
 security:
 \- apiKey: \[\]
 parameters:
 \- name: skill\_id\_or\_name
 in: path
 required: true
 schema:
 type: string
 responses:
 '200':
 description: Successful response
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/SkillDetail'
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
 x-guild-response-model: SkillDetail
 /skills/{skill\_id\_or\_name}/versions:
 post:
 operationId: create\_skill\_version
 tags:
 \- skills
 security:
 \- apiKey: \[\]
 parameters:
 \- name: skill\_id\_or\_name
 in: path
 required: true
 schema:
 type: string
 requestBody:
 required: true
 content:
 application/json:
 schema:
 properties:
 version\_number:
 title: Version Number
 type: string
 description:
 title: Description
 type: string
 body:
 maxLength: 262144
 title: Body
 type: string
 required:
 \- version\_number
 \- description
 \- body
 title: CreateSkillVersionInput
 type: object
 responses:
 '201':
 description: Successful response
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/SkillVersion'
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
 '400':
 description: Bad Request
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/ErrorResponse'
 /versions/{version\_id}:
 get:
 operationId: get\_agent\_version
 tags:
 \- agents
 security:
 \- apiKey: \[\]
 parameters:
 \- name: version\_id
 in: path
 required: true
 schema:
 type: string
 format: uuid
 responses:
 '200':
 description: Successful response
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/AgentVersion'
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
 /versions/{version\_id}/code:
 get:
 operationId: get\_version\_code
 tags:
 \- agents
 security:
 \- apiKey: \[\]
 parameters:
 \- name: version\_id
 in: path
 required: true
 schema:
 type: string
 format: uuid
 responses:
 '200':
 description: Successful response
 content:
 application/json:
 schema:
 type: object
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
 /versions/{version\_id}/publish:
 post:
 operationId: publish\_agent\_version
 tags:
 \- agents
 security:
 \- apiKey: \[\]
 parameters:
 \- name: version\_id
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
 properties:
 force\_publish:
 default: false
 title: Force Publish
 type: boolean
 title: PublishAgentVersionInput
 type: object
 responses:
 '200':
 description: Successful response
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/AgentVersion'
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
 '400':
 description: Bad Request
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/ErrorResponse'
 /versions/{version\_id}/publish/steps:
 get:
 operationId: list\_publish\_steps
 tags:
 \- agents
 security:
 \- apiKey: \[\]
 parameters:
 \- name: version\_id
 in: path
 required: true
 schema:
 type: string
 format: uuid
 responses:
 '200':
 description: Successful response
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/JobStep'
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
 /versions/{version\_id}/validation/steps:
 get:
 operationId: list\_validation\_steps
 tags:
 \- agents
 security:
 \- apiKey: \[\]
 parameters:
 \- name: version\_id
 in: path
 required: true
 schema:
 type: string
 format: uuid
 responses:
 '200':
 description: Successful response
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/JobStep'
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
 /workspace\_agents/{workspace\_agent\_id}/credential-associations:
 get:
 operationId: list\_workspace\_agent\_credential\_associations
 tags:
 \- workspaces
 security:
 \- apiKey: \[\]
 parameters:
 \- name: workspace\_agent\_id
 in: path
 required: true
 schema:
 type: string
 format: uuid
 \- name: limit
 in: query
 required: false
 schema:
 default: 20
 description: Maximum number of items to return.
 maximum: 1000
 minimum: 0
 title: Limit
 type: integer
 \- name: offset
 in: query
 required: false
 schema:
 default: 0
 description: Number of items to skip before returning results.
 maximum: 9223372036854775807
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
 $ref: '#/components/schemas/CredentialAssociation'
 pagination:
 type: object
 properties:
 total\_count:
 type: integer
 limit:
 type: integer
 offset:
 type: integer
 has\_more:
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
 post:
 operationId: create\_workspace\_agent\_credential\_association
 tags:
 \- workspaces
 security:
 \- apiKey: \[\]
 parameters:
 \- name: workspace\_agent\_id
 in: path
 required: true
 schema:
 type: string
 format: uuid
 requestBody:
 required: true
 content:
 application/json:
 schema:
 properties:
 auth\_config\_id:
 format: uuid
 title: Auth Config Id
 type: string
 credentials\_id:
 format: uuid
 title: Credentials Id
 type: string
 replace:
 default: false
 description: 'Revoke the bindings that would block this one, in
 the same transaction: either everything commits or nothing changes.
 A dedicated key and a grant serving every member exclude each
 other.'
 title: Replace
 type: boolean
 required:
 \- auth\_config\_id
 \- credentials\_id
 title: CreateCredentialAssociationInput
 type: object
 responses:
 '200':
 description: Successful response
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/CredentialAssociation'
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
 '400':
 description: Bad Request
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/ErrorResponse'
 /workspace\_agents/{workspace\_agent\_id}/credential-associations/{association\_id}:
 delete:
 operationId: delete\_workspace\_agent\_credential\_association
 tags:
 \- workspaces
 security:
 \- apiKey: \[\]
 parameters:
 \- name: workspace\_agent\_id
 in: path
 required: true
 schema:
 type: string
 format: uuid
 \- name: association\_id
 in: path
 required: true
 schema:
 type: string
 format: uuid
 responses:
 '200':
 description: Successful response
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/CredentialAssociation'
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
 '404':
 description: Not Found
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/ErrorResponse'
 /workspace\_agents/{workspace\_agent\_id}/credentials/api-key:
 post:
 operationId: connect\_workspace\_agent\_api\_key
 tags:
 \- workspaces
 security:
 \- apiKey: \[\]
 parameters:
 \- name: workspace\_agent\_id
 in: path
 required: true
 schema:
 type: string
 format: uuid
 \- name: owner\_id
 in: query
 required: true
 schema:
 title: Owner Id
 type: string
 \- name: auth\_config\_id
 in: query
 required: true
 schema:
 format: uuid
 title: Auth Config Id
 type: string
 \- name: event\_id
 in: query
 required: false
 schema:
 default: null
 title: Event Id
 nullable: true
 type: string
 \- name: replace
 in: query
 required: false
 schema:
 default: false
 description: 'Revoke the bindings that would block this one, in the same
 transaction: either everything commits or nothing changes. A dedicated
 key and a grant serving every member exclude each other.'
 title: Replace
 type: boolean
 responses:
 '200':
 description: Successful response
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/CredentialAssociation'
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
 '400':
 description: Bad Request
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/ErrorResponse'
 /workspaces:
 post:
 operationId: create\_workspace
 tags:
 \- workspaces
 security:
 \- apiKey: \[\]
 requestBody:
 required: true
 content:
 application/json:
 schema:
 properties:
 name:
 title: Name
 type: string
 owner\_id:
 title: Owner Id
 type: string
 required:
 \- name
 \- owner\_id
 title: CreateWorkspaceInput
 type: object
 responses:
 '200':
 description: Successful response
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/Workspace'
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
 '400':
 description: Bad Request
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/ErrorResponse'
 /workspaces/{workspace\_id\_or\_name}:
 get:
 operationId: get\_workspace
 tags:
 \- workspaces
 security:
 \- apiKey: \[\]
 parameters:
 \- name: workspace\_id\_or\_name
 in: path
 required: true
 schema:
 type: string
 responses:
 '200':
 description: Successful response
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/Workspace'
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
 /workspaces/{workspace\_id\_or\_name}/sessions:
 get:
 operationId: get\_workspace\_sessions
 tags:
 \- workspaces
 security:
 \- apiKey: \[\]
 parameters:
 \- name: workspace\_id\_or\_name
 in: path
 required: true
 schema:
 type: string
 \- name: limit
 in: query
 required: false
 schema:
 default: 20
 description: Maximum number of items to return.
 maximum: 1000
 minimum: 0
 title: Limit
 type: integer
 \- name: offset
 in: query
 required: false
 schema:
 default: 0
 description: Number of items to skip before returning results.
 maximum: 9223372036854775807
 minimum: 0
 title: Offset
 type: integer
 \- name: trigger\_id
 in: query
 required: false
 schema:
 default: null
 title: Trigger Id
 nullable: true
 format: uuid
 type: string
 \- name: types
 in: query
 required: false
 schema:
 default: null
 title: Types
 nullable: true
 type: string
 \- name: origin
 in: query
 required: false
 schema:
 default: null
 nullable: true
 description: Which Smith surface started the chat; unset outside Smith workspaces.
 enum:
 \- CHAT
 \- INSIGHTS
 title: SmithSessionOrigin
 type: string
 \- name: workspace\_agent\_id
 in: query
 required: false
 schema:
 default: null
 title: Workspace Agent Id
 nullable: true
 format: uuid
 type: string
 \- name: include\_archived
 in: query
 required: false
 schema:
 default: false
 title: Include Archived
 type: boolean
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
 $ref: '#/components/schemas/Session'
 pagination:
 type: object
 properties:
 total\_count:
 type: integer
 limit:
 type: integer
 offset:
 type: integer
 has\_more:
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
 post:
 operationId: create\_workspace\_session
 tags:
 \- workspaces
 security:
 \- apiKey: \[\]
 parameters:
 \- name: workspace\_id\_or\_name
 in: path
 required: true
 schema:
 type: string
 requestBody:
 required: false
 content:
 application/json:
 schema:
 type: object
 description: Fields inferred from source; types not verified.
 properties:
 session\_type: {}
 responses:
 '200':
 description: Successful response
 content:
 application/json:
 schema:
 type: object
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
 '400':
 description: Bad Request
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/ErrorResponse'
 /workspaces/{workspace\_id\_or\_name}/triggers:
 post:
 operationId: create\_trigger
 tags:
 \- workspaces
 security:
 \- apiKey: \[\]
 parameters:
 \- name: workspace\_id\_or\_name
 in: path
 required: true
 schema:
 type: string
 requestBody:
 required: false
 content:
 application/json:
 schema:
 discriminator:
 mapping:
 api: '#/components/schemas/CreateApiTriggerBody'
 time: '#/components/schemas/CreateTimeTriggerBody'
 webhook: '#/components/schemas/CreateWebhookTriggerBody'
 propertyName: type
 oneOf:
 \- $ref: '#/components/schemas/CreateWebhookTriggerBody'
 \- $ref: '#/components/schemas/CreateTimeTriggerBody'
 \- $ref: '#/components/schemas/CreateApiTriggerBody'
 responses:
 '200':
 description: Successful response
 content:
 application/json:
 schema:
 type: object
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
 '400':
 description: Bad Request
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/ErrorResponse'
 /workspaces/{workspace\_id\_or\_name}/workspace\_agents:
 get:
 operationId: get\_workspace\_agents
 tags:
 \- workspaces
 security:
 \- apiKey: \[\]
 parameters:
 \- name: workspace\_id\_or\_name
 in: path
 required: true
 schema:
 type: string
 \- name: sort\_by
 in: query
 required: false
 schema:
 default: null
 description: Column name to sort by; prefix with '-' for descending order.
 title: Sort By
 nullable: true
 type: string
 \- name: limit
 in: query
 required: false
 schema:
 default: 20
 description: Maximum number of items to return.
 maximum: 1000
 minimum: 0
 title: Limit
 type: integer
 \- name: offset
 in: query
 required: false
 schema:
 default: 0
 description: Number of items to skip before returning results.
 maximum: 9223372036854775807
 minimum: 0
 title: Offset
 type: integer
 \- name: search
 in: query
 required: false
 schema:
 default: null
 title: Search
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
 $ref: '#/components/schemas/WorkspaceAgent'
 pagination:
 type: object
 properties:
 total\_count:
 type: integer
 limit:
 type: integer
 offset:
 type: integer
 has\_more:
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
 post:
 operationId: add\_workspace\_agent
 tags:
 \- workspaces
 security:
 \- apiKey: \[\]
 parameters:
 \- name: workspace\_id\_or\_name
 in: path
 required: true
 schema:
 type: string
 requestBody:
 required: true
 content:
 application/json:
 schema:
 properties:
 agent\_id:
 format: uuid
 title: Agent Id
 type: string
 should\_autoupdate:
 default: true
 title: Should Autoupdate
 type: boolean
 is\_default\_chat\_agent:
 default: false
 title: Is Default Chat Agent
 type: boolean
 event\_id:
 default: null
 title: Event Id
 nullable: true
 format: uuid
 type: string
 required:
 \- agent\_id
 title: AddWorkspaceAgentInput
 type: object
 responses:
 '200':
 description: Successful response
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/WorkspaceAgent'
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
 '400':
 description: Bad Request
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/ErrorResponse'
components:
 schemas:
 Account:
 oneOf:
 \- $ref: '#/components/schemas/Organization'
 \- $ref: '#/components/schemas/User'
 AccountItem:
 description: 'An account as \`\`gen\_serialize\_account\`\` emits it. Users and

 organizations share the account pattern; \`\`email\_domain\`\` appears only

 for organizations.'
 properties:
 id:
 format: uuid
 title: Id
 type: string
 entity\_type:
 title: Entity Type
 type: string
 created\_at:
 format: date-time
 title: Created At
 type: string
 updated\_at:
 format: date-time
 title: Updated At
 type: string
 type:
 enum:
 \- user
 \- organization
 title: Type
 type: string
 name:
 title: Name
 type: string
 full\_name:
 title: Full Name
 nullable: true
 type: string
 avatar\_url:
 title: Avatar Url
 nullable: true
 type: string
 bio:
 title: Bio
 nullable: true
 type: string
 banner\_url:
 title: Banner Url
 nullable: true
 type: string
 website\_url:
 title: Website Url
 nullable: true
 type: string
 github\_url:
 title: Github Url
 nullable: true
 type: string
 x\_url:
 title: X Url
 nullable: true
 type: string
 linkedin\_url:
 title: Linkedin Url
 nullable: true
 type: string
 discord\_url:
 title: Discord Url
 nullable: true
 type: string
 youtube\_url:
 title: Youtube Url
 nullable: true
 type: string
 threads\_url:
 title: Threads Url
 nullable: true
 type: string
 cached\_likes\_public\_count:
 title: Cached Likes Public Count
 type: integer
 cached\_forks\_public\_count:
 title: Cached Forks Public Count
 type: integer
 cached\_installs\_public\_count:
 title: Cached Installs Public Count
 type: integer
 email\_domain:
 default: null
 title: Email Domain
 nullable: true
 type: string
 required:
 \- id
 \- entity\_type
 \- created\_at
 \- updated\_at
 \- type
 \- name
 \- full\_name
 \- avatar\_url
 \- bio
 \- banner\_url
 \- website\_url
 \- github\_url
 \- x\_url
 \- linkedin\_url
 \- discord\_url
 \- youtube\_url
 \- threads\_url
 \- cached\_likes\_public\_count
 \- cached\_forks\_public\_count
 \- cached\_installs\_public\_count
 title: AccountItem
 type: object
 Agent:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 agent\_type:
 type: string
 enum:
 \- GUILD\_TYPESCRIPT
 \- GUILD\_NATIVE
 \- GOOSE
 \- OPENCLAW
 \- LANGGRAPH
 \- ADK
 description:
 type: string
 maxLength: 8192
 description: Manual description field. Can be empty; the effective description
 falls back to generated\_description.
 is\_public:
 type: boolean
 description: Whether the asset is visible to the community or only its owner.
 name:
 type: string
 maxLength: 100
 description: Unique name identifying the asset within the owner account.
 owner\_id:
 type: string
 format: uuid
 description: The account that owns this entity.
 cached\_forks\_count:
 type: integer
 description: A cached version of the forks count. Might not be up to date.
 cached\_installs\_count:
 type: integer
 description: A cached version of the installs count. Might not be up to
 date.
 cached\_likes\_count:
 type: integer
 description: A cached version of the likes count. Might not be up to date.
 is\_pinned:
 type: boolean
 description: If true, it means the agent is pinned on the owner's account's
 profile.
 moderation\_state:
 type: string
 enum:
 \- ACTIVE
 \- DEMOTED
 \- UNLISTED
 \- DISABLED
 \- TAKEN\_DOWN
 description: Operator-controlled moderation/curation state. Owners cannot
 change this; only operators can, via the hub kebab menu or ops tooling.
 status:
 type: string
 enum:
 \- CREATED
 \- GIT\_REPOSITORY\_CREATED
 \- READY
 archived\_at:
 type: string
 format: date-time
 nullable: true
 archived\_by\_id:
 type: string
 format: uuid
 nullable: true
 avatar\_url:
 type: string
 maxLength: 255
 nullable: true
 category\_id:
 type: string
 format: uuid
 nullable: true
 description: The category this agent is sorted in.
 creation\_template:
 type: string
 enum:
 \- LLM
 \- AUTO\_MANAGED\_STATE
 \- BLANK
 \- GOOSE
 \- GUILD\_NATIVE
 \- OPENCLAW
 \- LANGGRAPH
 \- ADK
 nullable: true
 description: 'If applicable, the template that was selected during the creation
 of this agent. Note: it doesn''t mean the agent is still following the
 template now.'
 creator\_id:
 type: string
 format: uuid
 nullable: true
 description: The user, agent or API key that created this agent. Null for
 legacy rows created before creator attribution was recorded.
 forked\_from\_id:
 type: string
 format: uuid
 nullable: true
 description: If applicable, the ID of the agent version this agent was forked
 from.
 generated\_description:
 type: string
 maxLength: 8192
 nullable: true
 description: LLM-generated description based on agent code. Regenerated
 automatically on every commit.
 maintainer\_id:
 type: string
 format: uuid
 nullable: true
 description: OPTIONAL. Refers to the person within an organization that
 is tasked with maintaining the agent.
 archived\_by: {}
 category: {}
 creator: {}
 forks\_count:
 type: integer
 description: Number of times this agent has been forked
 full\_name:
 type: string
 description: Full agent name in format "owner\_name/agent\_name"
 git\_url:
 type: string
 description: URL to the agent's git repository
 installs\_count:
 type: integer
 description: Number of times this agent has been installed in workspaces
 is\_description\_autogenerated: {}
 last\_updated\_by: {}
 latest\_published\_version: {}
 latest\_version: {}
 likes\_count:
 type: integer
 description: Number of likes this agent has received
 maintainer:
 type: object
 nullable: true
 description: Maintainer of the agent (for organization-owned agents)
 owner:
 $ref: '#/components/schemas/Account'
 public\_profile\_url: {}
 type: {}
 viewer\_can\_edit:
 type: boolean
 description: Whether the current viewer can edit this agent
 AgentVersion:
 oneOf:
 \- $ref: '#/components/schemas/AgentVersionCommitted'
 \- $ref: '#/components/schemas/AgentVersionEphemeral'
 AgentVersionCommitted:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 agent\_id:
 type: string
 format: uuid
 author\_id:
 type: string
 format: uuid
 validation\_status:
 type: string
 enum:
 \- SKIPPED
 \- PENDING
 \- RUNNING
 \- PASSED
 \- FAILED
 dependencies:
 type: object
 nullable: true
 description: npm package.json dependencies
 description:
 type: string
 maxLength: 8192
 nullable: true
 description: Description for the agent extracted from the agent code.
 env\_references:
 type: array
 items: {}
 nullable: true
 description: Workspace variable keys referenced as {{env.KEY}} in the version's
 prompt, extracted at build time
 input\_schema:
 type: object
 nullable: true
 description: JSON Schema from Zod input
 llm\_models:
 type: array
 items: {}
 nullable: true
 description: 'Acceptable provider/model pairs from guild.yaml \`models\`,
 tried in order. An entry naming a model asks for exactly it; an entry
 naming only a provider lets the server pick. NULL means the agent declared
 none and runs on the session default. E.g. \[{"provider": "ANTHROPIC",\
 "model": "claude-sonnet-5"}, {"provider": "OPENAI"}\]'
 output\_schema:
 type: object
 nullable: true
 description: JSON Schema from Zod output
 published\_at:
 type: string
 format: date-time
 nullable: true
 publishing\_started\_at:
 type: string
 format: date-time
 nullable: true
 raw\_tools:
 type: array
 items: {}
 nullable: true
 description: Structured per-tool metadata. Each entry is a tool object discriminated
 by toolType (integration, legacy, agent, builtin).
 runtime\_environment\_id:
 type: string
 format: uuid
 nullable: true
 sha:
 type: string
 maxLength: 40
 nullable: true
 description: 'Git commit SHA (40-character hexadecimal). For agents: set
 on version creation. For integrations: set after code is stored in GitHub.'
 summary:
 type: string
 maxLength: 500
 nullable: true
 description: 'Commit message summary. For agents: set on version creation.
 For integrations: set after code is stored in GitHub.'
 tools:
 type: array
 items: {}
 nullable: true
 version\_number:
 type: string
 maxLength: 100
 nullable: true
 description: The semantic version number (i.e., MAJOR.MINOR.PATCH) of this
 version
 agent: {}
 author: {}
 status: {}
 version\_type: {}
 AgentVersionEphemeral:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 agent\_id:
 type: string
 format: uuid
 author\_id:
 type: string
 format: uuid
 files:
 type: object
 description: 'The files for this version and their content. Format: {\[key:\
 filename\]: content}'
 validation\_status:
 type: string
 enum:
 \- SKIPPED
 \- PENDING
 \- RUNNING
 \- PASSED
 \- FAILED
 dependencies:
 type: object
 nullable: true
 description: npm package.json dependencies
 description:
 type: string
 maxLength: 8192
 nullable: true
 description: Description for the agent extracted from the agent code.
 env\_references:
 type: array
 items: {}
 nullable: true
 description: Workspace variable keys referenced as {{env.KEY}} in the version's
 prompt, extracted at build time
 input\_schema:
 type: object
 nullable: true
 description: JSON Schema from Zod input
 llm\_models:
 type: array
 items: {}
 nullable: true
 description: 'Acceptable provider/model pairs from guild.yaml \`models\`,
 tried in order. An entry naming a model asks for exactly it; an entry
 naming only a provider lets the server pick. NULL means the agent declared
 none and runs on the session default. E.g. \[{"provider": "ANTHROPIC",\
 "model": "claude-sonnet-5"}, {"provider": "OPENAI"}\]'
 output\_schema:
 type: object
 nullable: true
 description: JSON Schema from Zod output
 raw\_tools:
 type: array
 items: {}
 nullable: true
 description: Structured per-tool metadata. Each entry is a tool object discriminated
 by toolType (integration, legacy, agent, builtin).
 runtime\_environment\_id:
 type: string
 format: uuid
 nullable: true
 tools:
 type: array
 items: {}
 nullable: true
 version\_number:
 type: string
 maxLength: 100
 nullable: true
 description: The semantic version number (i.e., MAJOR.MINOR.PATCH) of this
 version
 agent: {}
 author: {}
 published\_at: {}
 publishing\_started\_at: {}
 sha: {}
 status: {}
 summary: {}
 version\_type: {}
 AgentVersionFile:
 properties:
 path:
 title: Path
 type: string
 content:
 title: Content
 type: string
 required:
 \- path
 \- content
 title: AgentVersionFile
 type: object
 AgentVersionType:
 enum:
 \- EPHEMERAL
 \- COMMITTED
 title: AgentVersionType
 type: string
 ApiKey:
 description: 'An account API key as every key-returning endpoint serializes
 it. The

 one-time secret is shown only in the creation response and never appears

 in this shape.'
 properties:
 id:
 format: uuid
 title: Id
 type: string
 entity\_type:
 title: Entity Type
 type: string
 created\_at:
 format: date-time
 title: Created At
 type: string
 updated\_at:
 format: date-time
 title: Updated At
 type: string
 type:
 title: Type
 type: string
 enum:
 \- account
 name:
 title: Name
 nullable: true
 type: string
 permissions:
 description: The key's scopes; write implies read.
 items:
 $ref: '#/components/schemas/ApiKeyScope'
 title: Permissions
 type: array
 owner:
 additionalProperties: true
 description: The account the key acts as (user or organization, item shape).
 title: Owner
 type: object
 created\_by:
 additionalProperties: true
 description: The user who minted the key (item shape).
 title: Created By
 type: object
 required:
 \- id
 \- entity\_type
 \- created\_at
 \- updated\_at
 \- type
 \- name
 \- permissions
 \- owner
 \- created\_by
 title: ApiKey
 type: object
 ApiKeyScope:
 properties:
 group:
 $ref: '#/components/schemas/ApiKeyScopeGroup'
 access:
 $ref: '#/components/schemas/ApiKeyScopeAccess'
 required:
 \- group
 \- access
 title: ApiKeyScope
 type: object
 ApiKeyScopeAccess:
 enum:
 \- read
 \- write
 title: ApiKeyScopeAccess
 type: string
 ApiKeyScopeGroup:
 enum:
 \- agents
 \- sessions
 \- workspaces
 \- skills
 \- integrations
 \- tool\_call
 title: ApiKeyScopeGroup
 type: string
 ConfigureLlmIntegrationToolsInput:
 properties:
 integration:
 title: Integration
 type: string
 tools:
 items:
 type: string
 title: Tools
 type: array
 required:
 \- integration
 \- tools
 title: ConfigureLlmIntegrationToolsInput
 type: object
 CreateApiTriggerBody:
 properties:
 workspace\_agent\_id:
 format: uuid
 title: Workspace Agent Id
 type: string
 name:
 default: null
 title: Name
 nullable: true
 type: string
 type:
 title: Type
 type: string
 enum:
 \- api
 required:
 \- workspace\_agent\_id
 \- type
 title: CreateApiTriggerBody
 type: object
 CreateJsonSessionEventInput:
 properties:
 agent\_id:
 default: null
 title: Agent Id
 nullable: true
 type: string
 selected\_skills:
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
 \- json
 required:
 \- content
 \- mode
 title: CreateJsonSessionEventInput
 type: object
 CreateMultimodalSessionEventInput:
 properties:
 agent\_id:
 default: null
 title: Agent Id
 nullable: true
 type: string
 selected\_skills:
 default: null
 title: Selected Skills
 nullable: true
 items:
 type: string
 type: array
 content:
 items:
 $ref: '#/components/schemas/\_MultimodalContentPart'
 minItems: 1
 title: Content
 type: array
 mode:
 title: Mode
 type: string
 enum:
 \- multimodal
 required:
 \- content
 \- mode
 title: CreateMultimodalSessionEventInput
 type: object
 CreateMultipartSessionEventInput:
 properties:
 agent\_id:
 default: null
 title: Agent Id
 nullable: true
 type: string
 selected\_skills:
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
 \- multipart
 required:
 \- content
 \- mode
 title: CreateMultipartSessionEventInput
 type: object
 CreateTextSessionEventInput:
 properties:
 agent\_id:
 default: null
 title: Agent Id
 nullable: true
 type: string
 selected\_skills:
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
 \- text
 required:
 \- content
 title: CreateTextSessionEventInput
 type: object
 CreateTimeTriggerBody:
 properties:
 workspace\_agent\_id:
 format: uuid
 title: Workspace Agent Id
 type: string
 name:
 default: null
 title: Name
 nullable: true
 type: string
 type:
 title: Type
 type: string
 enum:
 \- time
 frequency:
 $ref: '#/components/schemas/TimeTriggerFrequency'
 agent\_input:
 additionalProperties: true
 title: Agent Input
 type: object
 time\_of\_day:
 default: null
 title: Time Of Day
 nullable: true
 type: string
 days\_of\_month:
 default: null
 title: Days Of Month
 nullable: true
 type: string
 days\_of\_week:
 default: null
 title: Days Of Week
 nullable: true
 type: string
 minutes\_of\_hour:
 default: null
 title: Minutes Of Hour
 nullable: true
 type: string
 cron\_expression:
 default: null
 title: Cron Expression
 nullable: true
 type: string
 cron\_timezone:
 default: null
 title: Cron Timezone
 nullable: true
 type: string
 required:
 \- workspace\_agent\_id
 \- type
 \- frequency
 \- agent\_input
 title: CreateTimeTriggerBody
 type: object
 CreateWebhookTriggerBody:
 properties:
 workspace\_agent\_id:
 format: uuid
 title: Workspace Agent Id
 type: string
 name:
 default: null
 title: Name
 nullable: true
 type: string
 type:
 title: Type
 type: string
 enum:
 \- webhook
 webhook\_config\_id:
 format: uuid
 title: Webhook Config Id
 type: string
 event\_type:
 default: null
 title: Event Type
 nullable: true
 type: string
 action:
 default: null
 title: Action
 nullable: true
 type: string
 service\_config:
 default: null
 title: Service Config
 nullable: true
 additionalProperties: true
 type: object
 agent\_input:
 default: null
 title: Agent Input
 nullable: true
 additionalProperties: true
 type: object
 required:
 \- workspace\_agent\_id
 \- type
 \- webhook\_config\_id
 title: CreateWebhookTriggerBody
 type: object
 CredentialAssociation:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 auth\_config\_id:
 type: string
 format: uuid
 description: Integration auth config this row applies to
 created\_by\_id:
 type: string
 format: uuid
 description: The user or API key that granted this credential to the agent.
 target\_id:
 type: string
 format: uuid
 description: Workspace agent install receiving the credential; the association
 is scoped to this install's workspace. Account-wide availability is plain
 credential ownership with no association row.
 kind:
 type: string
 enum:
 \- CONNECTED
 \- GRANTED
 description: GRANTED = existing credential shared with the agent; CONNECTED
 = credential created for the agent (connect flow).
 credentials\_id:
 type: string
 format: uuid
 nullable: true
 description: Linked credential row; null while OAuth connect is pending.
 integration: {}
 member\_owned: {}
 owner: {}
 runs\_as: {}
 workspace: {}
 workspace\_agent\_id: {}
 ErrorResponse:
 type: object
 properties:
 error:
 type: string
 message:
 type: string
 Event:
 oneOf:
 \- $ref: '#/components/schemas/EventContainerLog'
 \- $ref: '#/components/schemas/EventAgentConsole'
 \- $ref: '#/components/schemas/EventAgentInstallRequest'
 \- $ref: '#/components/schemas/EventAgentNotificationError'
 \- $ref: '#/components/schemas/EventAgentNotificationMessage'
 \- $ref: '#/components/schemas/EventAgentNotificationProgress'
 \- $ref: '#/components/schemas/EventCredentialsRequest'
 \- $ref: '#/components/schemas/EventInterrupted'
 \- $ref: '#/components/schemas/EventLlmDone'
 \- $ref: '#/components/schemas/EventLlmStart'
 \- $ref: '#/components/schemas/EventRuntimeDone'
 \- $ref: '#/components/schemas/EventRuntimeError'
 \- $ref: '#/components/schemas/EventRuntimeRunning'
 \- $ref: '#/components/schemas/EventRuntimeStart'
 \- $ref: '#/components/schemas/EventRuntimeWaiting'
 \- $ref: '#/components/schemas/EventSecurity'
 \- $ref: '#/components/schemas/EventSystemError'
 \- $ref: '#/components/schemas/EventSystemMessage'
 \- $ref: '#/components/schemas/EventTriggerMessage'
 \- $ref: '#/components/schemas/EventUserMessage'
 EventAgentConsole:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 content:
 type: string
 level:
 type: string
 enum:
 \- DEBUG
 \- INFO
 \- WARN
 \- ERROR
 task\_id:
 type: string
 format: uuid
 type: {}
 EventAgentInstallRequest:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 requested\_agent\_id:
 type: string
 format: uuid
 description: The agent requested to be installed
 task\_id:
 type: string
 format: uuid
 installed\_agent\_id:
 type: string
 format: uuid
 nullable: true
 description: The workspace agent created when this request was fulfilled
 processed\_at:
 type: string
 format: date-time
 nullable: true
 description: If the request has been declined, this is when it happened.
 processed\_by\_id:
 type: string
 format: uuid
 nullable: true
 description: The user who declined or accepted this request, if applicable.
 agent: {}
 installed\_agent: {}
 is\_fulfilled: {}
 requested\_agent: {}
 type: {}
 EventAgentNotificationError:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 content:
 type: object
 task\_id:
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
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 content:
 type: object
 task\_id:
 type: string
 format: uuid
 type: {}
 EventAgentNotificationProgress:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 content:
 type: object
 task\_id:
 type: string
 format: uuid
 type: {}
 EventContainerLog:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 task\_id:
 type: string
 format: uuid
 level:
 type: string
 enum:
 \- INFO
 \- ERROR
 nullable: true
 description: 'Severity of the line: INFO for ordinary output, ERROR for
 error-level output. Nullable for now; pre-existing rows have no level.'
 message:
 type: string
 maxLength: 65536
 timestamp:
 type: string
 format: date-time
 description: When the line was produced in the container (not received)
 type: {}
 EventCredentialsRequest:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 auth\_config\_id:
 type: string
 format: uuid
 description: The auth config this credentials should use
 task\_id:
 type: string
 format: uuid
 is\_fulfilled:
 type: boolean
 description: Indicates whether the request has been fulfilled. Skipped requests
 are also marked fulfilled (see skipped\_at). If it is set to true, credentials
 is null, and skipped\_at is null, it means the credentials has been deleted
 later.
 credentials\_id:
 type: string
 format: uuid
 nullable: true
 description: The credentials created when this request was fulfilled
 skipped\_at:
 type: string
 format: date-time
 nullable: true
 description: If the request was skipped, when it happened.
 skipped\_by\_id:
 type: string
 format: uuid
 nullable: true
 description: The user who skipped this request, if applicable.
 target\_account\_id:
 type: string
 format: uuid
 nullable: true
 description: The account the credentials should be installed in, if applicable.
 This is used by The Smith to request installs in other accounts.
 agent: {}
 integration: {}
 target\_account: {}
 type: {}
 EventInterrupted:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 interrupted\_at:
 type: string
 format: date-time
 description: Timestamp when the session was interrupted
 interrupted\_by\_id:
 type: string
 format: uuid
 description: User who interrupted the session
 task\_id:
 type: string
 format: uuid
 interrupted\_by: {}
 type: {}
 EventLlmDone:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 body:
 type: string
 headers:
 type: object
 llm\_event\_id:
 type: string
 format: uuid
 status\_code:
 type: integer
 task\_id:
 type: string
 format: uuid
 type: {}
 EventLlmStart:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 headers:
 type: object
 inference\_provider\_id:
 type: string
 format: uuid
 llm\_provider:
 type: string
 enum:
 \- ANTHROPIC
 \- OPENAI
 \- GEMINI
 \- FAKE\_LLM
 \- META
 \- DEEPSEEK
 \- ALIBABA
 \- MOONSHOT
 \- ZAI
 payload:
 type: object
 task\_id:
 type: string
 format: uuid
 llm\_model:
 type: string
 maxLength: 100
 nullable: true
 inference\_provider: {}
 model: {}
 model\_publisher: {}
 type: {}
 EventRuntimeDone:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 content:
 type: object
 task\_id:
 type: string
 format: uuid
 type: {}
 EventRuntimeError:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 content:
 type: string
 task\_id:
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
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 task\_id:
 type: string
 format: uuid
 type: {}
 EventRuntimeStart:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 content:
 type: object
 task\_id:
 type: string
 format: uuid
 type: {}
 EventRuntimeWaiting:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 task\_id:
 type: string
 format: uuid
 type: {}
 EventSecurity:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 decision:
 type: string
 enum:
 \- ALLOW
 \- DENY
 \- ERROR
 description: Security decision outcome.
 message:
 type: string
 maxLength: 1024
 description: Human-readable security event summary.
 operation:
 type: string
 maxLength: 255
 description: Integration operation or action evaluated.
 reason\_code:
 type: string
 enum:
 \- POLICY\_DENIED
 \- CREDENTIAL\_UNAVAILABLE
 \- PRIVILEGE\_ESCALATION\_DENIED
 \- PLATFORM\_ACCESS\_DENIED
 \- ACCESS\_ALLOWED
 description: Stable machine code for why the decision occurred.
 task\_id:
 type: string
 format: uuid
 acting\_user\_id:
 type: string
 format: uuid
 nullable: true
 description: Human acting on behalf of the task when the decision was recorded.
 capability:
 type: string
 maxLength: 32
 nullable: true
 description: Capability evaluated for this decision (read, write, delete,
 admin).
 credentials\_id:
 type: string
 format: uuid
 nullable: true
 description: Credentials involved in the security decision when applicable.
 details:
 type: object
 nullable: true
 description: Optional structured audit context beyond task/session links.
 acting\_user: {}
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
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 details:
 type: object
 description: An arbitrary JSON object that stores details about the error.
 message:
 type: string
 maxLength: 65536
 description: A user-visible message that describes the error that occurred.
 task\_id:
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
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 content:
 type: object
 task\_id:
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
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 content:
 type: object
 task\_id:
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
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 author\_id:
 type: string
 format: uuid
 description: 'Who sent this message: a user, or an account API key relaying
 a conversation on behalf of its account.'
 content:
 type: array
 items: {}
 task\_id:
 type: string
 format: uuid
 author: {}
 content\_parts: {}
 type: {}
 JobStep:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 job\_id:
 type: string
 format: uuid
 name:
 type: string
 maxLength: 100
 description: Step name (e.g., tsc, babel, dependencies)
 status:
 type: string
 enum:
 \- PENDING
 \- RUNNING
 \- SUCCEEDED
 \- FAILED
 \- SKIPPED
 \- ERRORED
 completed\_at:
 type: string
 format: date-time
 nullable: true
 content:
 type: string
 nullable: true
 index:
 type: integer
 nullable: true
 description: The index of the step in the execution.
 started\_at:
 type: string
 format: date-time
 nullable: true
 job: {}
 OauthIdentity:
 description: 'Who an OAuth access token acts as: the consenting user, the client

 that holds the token, and the scopes the user granted.'
 properties:
 type:
 title: Type
 type: string
 enum:
 \- oauth
 user:
 additionalProperties: true
 description: The consenting user (item shape).
 title: User
 type: object
 client:
 additionalProperties: true
 description: The OAuth client holding the token.
 title: Client
 type: object
 scopes:
 description: The granted scopes.
 items:
 $ref: '#/components/schemas/ApiKeyScope'
 title: Scopes
 type: array
 required:
 \- type
 \- user
 \- client
 \- scopes
 title: OauthIdentity
 type: object
 Organization:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 creator\_id:
 type: string
 format: uuid
 description: The user who created this organization. Note that this does
 not give that user membership.
 name:
 type: string
 maxLength: 100
 description: The unique name identifying this account.
 cached\_forks\_count:
 type: integer
 description: A cached version of the forks count. Might not be up to date.
 cached\_forks\_public\_count:
 type: integer
 description: A cached version of the forks count for public agents. Might
 not be up to date.
 cached\_installs\_count:
 type: integer
 description: A cached version of the installs count. Might not be up to
 date.
 cached\_installs\_public\_count:
 type: integer
 description: A cached version of the installs count for public agents. Might
 not be up to date.
 cached\_likes\_count:
 type: integer
 description: A cached version of the likes count. Might not be up to date.
 cached\_likes\_public\_count:
 type: integer
 description: A cached version of the likes count for public agents. Might
 not be up to date.
 avatar\_url:
 type: string
 maxLength: 255
 nullable: true
 banner\_url:
 type: string
 maxLength: 255
 nullable: true
 bio:
 type: string
 maxLength: 255
 nullable: true
 discord\_url:
 type: string
 maxLength: 255
 nullable: true
 email\_domain:
 type: string
 maxLength: 100
 nullable: true
 description: The email domain of the organization. Members will be automatically
 invited to this organization if they have an email with this domain.
 full\_name:
 type: string
 maxLength: 100
 nullable: true
 description: The display name of the account.
 github\_url:
 type: string
 maxLength: 255
 nullable: true
 linkedin\_url:
 type: string
 maxLength: 255
 nullable: true
 threads\_url:
 type: string
 maxLength: 255
 nullable: true
 website\_url:
 type: string
 maxLength: 255
 nullable: true
 x\_url:
 type: string
 maxLength: 255
 nullable: true
 youtube\_url:
 type: string
 maxLength: 255
 nullable: true
 member\_count: {}
 viewer\_membership\_id: {}
 viewer\_membership\_public: {}
 viewer\_role:
 type: string
 enum:
 \- ADMIN
 \- MEMBER
 nullable: true
 description: Current viewer's role in the organization (null if not a member)
 type:
 type: string
 enum:
 \- organization
 description: Account type, always "organization"
 PaginationInfo:
 properties:
 total\_count:
 title: Total Count
 type: integer
 limit:
 title: Limit
 type: integer
 offset:
 title: Offset
 type: integer
 has\_more:
 title: Has More
 type: boolean
 required:
 \- total\_count
 \- limit
 \- offset
 \- has\_more
 title: PaginationInfo
 type: object
 PublicMe:
 anyOf:
 \- $ref: '#/components/schemas/ApiKey'
 \- $ref: '#/components/schemas/OauthIdentity'
 description: '\`\`/v1/me\`\` answers for whichever credential called it; \`\`type\`\`

 tells the two apart.'
 title: PublicMe
 RuntimeContainer:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 base\_path:
 type: string
 maxLength: 255
 description: 'The base path on which the runtime''s web server is exposed.
 Guildcore will call // '
 created\_by\_id:
 type: string
 format: uuid
 workspace\_id:
 type: string
 format: uuid
 locked\_for\_session\_id:
 type: string
 format: uuid
 nullable: true
 description: If set, only tasks in that specific session can use the runtime
 container, otherwise it can be shared within the workspace.
 runtime\_environment\_id:
 type: string
 format: uuid
 nullable: true
 description: The environment this container was created from, when one was
 named. Null for containers booted from a bare image.
 container\_id: {}
 created\_by: {}
 destroyed\_at: {}
 environment: {}
 image: {}
 started\_at: {}
 status: {}
 workspace: {}
 Session:
 oneOf:
 \- $ref: '#/components/schemas/SessionAgentTest'
 \- $ref: '#/components/schemas/SessionChat'
 \- $ref: '#/components/schemas/SessionGateway'
 \- $ref: '#/components/schemas/SessionTriggerApi'
 \- $ref: '#/components/schemas/SessionTriggerTime'
 \- $ref: '#/components/schemas/SessionTriggerWebhook'
 SessionAgentTest:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 initiator\_id:
 type: string
 format: uuid
 description: 'Who started this agent test session: a user, or an account
 API key testing from CI.'
 test\_type:
 type: string
 enum:
 \- MANUAL
 \- EVAL
 description: Eval trials run as agent-test sessions; this separates them
 from sessions a person started from the agent editor.
 version\_override\_id:
 type: string
 format: uuid
 description: The specific agent version being tested in this session.
 workspace\_id:
 type: string
 format: uuid
 description: The workspace this session belongs to.
 context\_id:
 type: string
 format: uuid
 nullable: true
 description: The context used in this session, if available.
 context\_override\_id:
 type: string
 format: uuid
 nullable: true
 description: Optional context override for testing purposes.
 interrupted\_at:
 type: string
 format: date-time
 nullable: true
 description: Timestamp when this session was interrupted by a user. If set,
 no new messages can be sent and tasks cannot be executed.
 interrupted\_by\_id:
 type: string
 format: uuid
 nullable: true
 description: User who interrupted this session.
 seed\_context:
 type: string
 maxLength: 262144
 nullable: true
 description: Optional hidden pre-seed text for this session only, prepended
 to the agent's context on the first turn (e.g. the onboarding handoff
 tour transcript). Not a workspace context.
 SessionChat:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 initiator\_id:
 type: string
 format: uuid
 description: 'Who started this chat session: a user, or an account API key
 acting as its account.'
 workspace\_id:
 type: string
 format: uuid
 description: The workspace this session belongs to.
 archived\_at:
 type: string
 format: date-time
 nullable: true
 archived\_by\_id:
 type: string
 format: uuid
 nullable: true
 assistant\_version\_id:
 type: string
 format: uuid
 nullable: true
 description: The assistant version resolved for this chat session. Null
 for legacy sessions and direct agent sessions that did not use the assistant.
 context\_id:
 type: string
 format: uuid
 nullable: true
 description: The context used in this session, if available.
 interrupted\_at:
 type: string
 format: date-time
 nullable: true
 description: Timestamp when this session was interrupted by a user. If set,
 no new messages can be sent and tasks cannot be executed.
 interrupted\_by\_id:
 type: string
 format: uuid
 nullable: true
 description: User who interrupted this session.
 name:
 type: string
 maxLength: 100
 nullable: true
 description: The name/title of this chat session. Usually generated by an
 LLM based on the first prompt.
 origin:
 type: string
 enum:
 \- CHAT
 \- INSIGHTS
 nullable: true
 description: 'Set only on chats in a Smith workspace: CHAT for the Smith
 chat, INSIGHTS for a conversation the Ask Insights panel started. Chat
 lists filter on it to keep panel conversations out of the sidebar.'
 seed\_context:
 type: string
 maxLength: 262144
 nullable: true
 description: Optional hidden pre-seed text for this session only, prepended
 to the agent's context on the first turn (e.g. the onboarding handoff
 tour transcript). Not a workspace context.
 SessionGateway:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 initiator\_id:
 type: string
 format: uuid
 description: The member whose calls this session carries. A profile an admin
 declares is used by everyone in the workspace, so sessions are per member
 rather than per profile.
 ip\_address:
 type: string
 maxLength: 45
 description: The IP address of the client which initiated this session.
 last\_active\_at:
 type: string
 format: date-time
 description: 'When this session last carried a tool call. Written on every
 call: a session rolls over once it goes quiet, and nothing else touches
 the row, so updated\_at would measure the session''s age instead of its
 idleness.'
 profile\_id:
 type: string
 format: uuid
 description: The gateway profile this session's calls run as. Names the
 install directly, rather than leaving it to be inferred from the agent
 version, which several profiles share.
 workspace\_id:
 type: string
 format: uuid
 description: The workspace this session belongs to.
 context\_id:
 type: string
 format: uuid
 nullable: true
 description: The context used in this session, if available.
 interrupted\_at:
 type: string
 format: date-time
 nullable: true
 description: Timestamp when this session was interrupted by a user. If set,
 no new messages can be sent and tasks cannot be executed.
 interrupted\_by\_id:
 type: string
 format: uuid
 nullable: true
 description: User who interrupted this session.
 seed\_context:
 type: string
 maxLength: 262144
 nullable: true
 description: Optional hidden pre-seed text for this session only, prepended
 to the agent's context on the first turn (e.g. the onboarding handoff
 tour transcript). Not a workspace context.
 user\_agent:
 type: string
 maxLength: 1024
 nullable: true
 description: The User-Agent of the connecting client, naming the assistant
 driving this profile. Unset when the client sends no header.
 SessionTriggerApi:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 api\_key\_id:
 type: string
 format: uuid
 description: The API key which initiated this session.
 ip\_address:
 type: string
 maxLength: 45
 description: The IP address of the client which initiated this session.
 trigger\_id:
 type: string
 format: uuid
 description: The trigger that initiated this session.
 workspace\_id:
 type: string
 format: uuid
 description: The workspace this session belongs to.
 context\_id:
 type: string
 format: uuid
 nullable: true
 description: The context used in this session, if available.
 interrupted\_at:
 type: string
 format: date-time
 nullable: true
 description: Timestamp when this session was interrupted by a user. If set,
 no new messages can be sent and tasks cannot be executed.
 interrupted\_by\_id:
 type: string
 format: uuid
 nullable: true
 description: User who interrupted this session.
 seed\_context:
 type: string
 maxLength: 262144
 nullable: true
 description: Optional hidden pre-seed text for this session only, prepended
 to the agent's context on the first turn (e.g. the onboarding handoff
 tour transcript). Not a workspace context.
 SessionTriggerTime:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 trigger\_id:
 type: string
 format: uuid
 description: The trigger that initiated this session.
 workspace\_id:
 type: string
 format: uuid
 description: The workspace this session belongs to.
 context\_id:
 type: string
 format: uuid
 nullable: true
 description: The context used in this session, if available.
 interrupted\_at:
 type: string
 format: date-time
 nullable: true
 description: Timestamp when this session was interrupted by a user. If set,
 no new messages can be sent and tasks cannot be executed.
 interrupted\_by\_id:
 type: string
 format: uuid
 nullable: true
 description: User who interrupted this session.
 seed\_context:
 type: string
 maxLength: 262144
 nullable: true
 description: Optional hidden pre-seed text for this session only, prepended
 to the agent's context on the first turn (e.g. the onboarding handoff
 tour transcript). Not a workspace context.
 SessionTriggerWebhook:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 integration\_webhook\_id:
 type: string
 format: uuid
 description: The webhook that triggered this session.
 trigger\_id:
 type: string
 format: uuid
 description: The webhook trigger that initiated this session.
 workspace\_id:
 type: string
 format: uuid
 description: The workspace this session belongs to.
 context\_id:
 type: string
 format: uuid
 nullable: true
 description: The context used in this session, if available.
 interrupted\_at:
 type: string
 format: date-time
 nullable: true
 description: Timestamp when this session was interrupted by a user. If set,
 no new messages can be sent and tasks cannot be executed.
 interrupted\_by\_id:
 type: string
 format: uuid
 nullable: true
 description: User who interrupted this session.
 remote\_id:
 type: string
 maxLength: 255
 nullable: true
 description: Remote identifier for correlating related events to this session.
 seed\_context:
 type: string
 maxLength: 262144
 nullable: true
 description: Optional hidden pre-seed text for this session only, prepended
 to the agent's context on the first turn (e.g. the onboarding handoff
 tour transcript). Not a workspace context.
 Skill:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 is\_public:
 type: boolean
 description: Whether the asset is visible to the community or only its owner.
 name:
 type: string
 maxLength: 100
 description: Unique name identifying the asset within the owner account.
 owner\_id:
 type: string
 format: uuid
 description: The account that owns this entity.
 archived\_at:
 type: string
 format: date-time
 nullable: true
 archived\_by\_id:
 type: string
 format: uuid
 nullable: true
 avatar\_url:
 type: string
 maxLength: 255
 nullable: true
 creator\_id:
 type: string
 format: uuid
 nullable: true
 description: The user or API key that created this skill. Null for legacy
 rows created before creator attribution was recorded.
 overview:
 type: string
 maxLength: 8192
 nullable: true
 description: Optional human-facing overview for display and indexing. Falls
 back to the latest version description if not set.
 archived\_by: {}
 creator: {}
 full\_name: {}
 last\_updated\_by: {}
 latest\_version: {}
 likes\_count: {}
 owner: {}
 type: {}
 viewer\_can\_edit: {}
 SkillDetail:
 description: 'A skill as \`\`gen\_serialize\_skill\`\` emits it. \`\`full\_name\`\`,

 \`\`likes\_count\`\` and \`\`viewer\_can\_edit\`\` are computed at serialization

 time and exist on no entity.'
 properties:
 id:
 format: uuid
 title: Id
 type: string
 entity\_type:
 title: Entity Type
 type: string
 created\_at:
 format: date-time
 title: Created At
 type: string
 updated\_at:
 format: date-time
 title: Updated At
 type: string
 type:
 title: Type
 type: string
 enum:
 \- skill
 full\_name:
 title: Full Name
 type: string
 name:
 maxLength: 100
 title: Name
 type: string
 overview:
 title: Overview
 nullable: true
 maxLength: 8192
 type: string
 is\_public:
 title: Is Public
 type: boolean
 avatar\_url:
 title: Avatar Url
 nullable: true
 maxLength: 255
 type: string
 archived\_at:
 title: Archived At
 nullable: true
 format: date-time
 type: string
 owner:
 $ref: '#/components/schemas/AccountItem'
 likes\_count:
 title: Likes Count
 type: integer
 viewer\_can\_edit:
 title: Viewer Can Edit
 type: boolean
 archived\_by:
 nullable: true
 anyOf:
 \- $ref: '#/components/schemas/AccountItem'
 \- nullable: true
 enum:
 \- null
 latest\_version:
 nullable: true
 anyOf:
 \- $ref: '#/components/schemas/SkillVersionItem'
 \- nullable: true
 enum:
 \- null
 required:
 \- id
 \- entity\_type
 \- created\_at
 \- updated\_at
 \- type
 \- full\_name
 \- name
 \- overview
 \- is\_public
 \- avatar\_url
 \- archived\_at
 \- owner
 \- likes\_count
 \- viewer\_can\_edit
 \- archived\_by
 \- latest\_version
 title: SkillDetail
 type: object
 SkillVersion:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 author\_id:
 type: string
 format: uuid
 description: The user or API key that created this skill version.
 body:
 type: string
 maxLength: 262144
 description: Full markdown content for this skill version.
 description:
 type: string
 maxLength: 8192
 description: Runtime-facing description that tells the LLM when to activate
 this skill.
 skill\_id:
 type: string
 format: uuid
 description: The skill this version belongs to.
 version\_number:
 type: string
 maxLength: 64
 description: The semantic version number (MAJOR.MINOR.PATCH).
 author: {}
 skill: {}
 type: {}
 SkillVersionItem:
 description: A skill version as \`\`gen\_serialize\_skill\_version\`\` emits it (ITEM).
 properties:
 id:
 format: uuid
 title: Id
 type: string
 entity\_type:
 title: Entity Type
 type: string
 created\_at:
 format: date-time
 title: Created At
 type: string
 updated\_at:
 format: date-time
 title: Updated At
 type: string
 type:
 title: Type
 type: string
 enum:
 \- skill\_version
 version\_number:
 title: Version Number
 type: integer
 description:
 title: Description
 nullable: true
 type: string
 required:
 \- id
 \- entity\_type
 \- created\_at
 \- updated\_at
 \- type
 \- version\_number
 \- description
 title: SkillVersionItem
 type: object
 Task:
 oneOf:
 \- $ref: '#/components/schemas/TaskAgent'
 \- $ref: '#/components/schemas/TaskTool'
 TaskAgent:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 session\_id:
 type: string
 format: uuid
 status:
 type: string
 enum:
 \- CREATED
 \- DISPATCHED
 \- STARTED
 \- RUNNING
 \- WAITING
 \- ERROR
 \- DONE
 \- INTERRUPTED
 notified\_at:
 type: string
 format: date-time
 nullable: true
 description: "Date and time when this task output was sent to the runtime.\\n\
 \ This should be None if the task is not DONE or ERROR,\
 \ or if the\\n runtime hasn't been resumed yet."
 parent\_task\_id:
 type: string
 format: uuid
 nullable: true
 runtime\_id:
 type: string
 format: uuid
 nullable: true
 description: An optional runtime, if the agent is not run in the default
 Guild runtime.
 saved\_state:
 type: string
 nullable: true
 span\_id:
 nullable: true
 description: Span id of the single invoke\_agent span that covers this agent
 task across all of its start/resume executions.
 trace\_id:
 nullable: true
 version\_id:
 type: string
 format: uuid
 nullable: true
 description: The version of the agent that this task is running. If None,
 it means we're running the assistant.
 agent: {}
 cache\_read\_tokens: {}
 cache\_write\_tokens: {}
 input\_tokens: {}
 llm\_call\_count: {}
 output\_tokens: {}
 parent\_task: {}
 token\_usage: {}
 total\_tokens: {}
 version: {}
 TaskTool:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 parent\_task\_id:
 type: string
 format: uuid
 session\_id:
 type: string
 format: uuid
 status:
 type: string
 enum:
 \- CREATED
 \- DISPATCHED
 \- STARTED
 \- RUNNING
 \- WAITING
 \- ERROR
 \- DONE
 \- INTERRUPTED
 tool\_call\_id:
 type: string
 tool\_name:
 type: string
 maxLength: 255
 http\_status\_code:
 type: integer
 nullable: true
 description: The HTTP response code of the response
 notified\_at:
 type: string
 format: date-time
 nullable: true
 description: "Date and time when this task output was sent to the runtime.\\n\
 \ This should be None if the task is not DONE or ERROR,\
 \ or if the\\n runtime hasn't been resumed yet."
 request\_bytes:
 type: integer
 nullable: true
 description: The number of bytes in the outgoing request
 response\_bytes:
 type: integer
 nullable: true
 description: The number of bytes in the response
 response\_data:
 type: string
 nullable: true
 description: Full JSON response body, stored only when the response was
 projected due to size
 parent\_task: {}
 token\_usage: {}
 TimeTriggerFrequency:
 enum:
 \- HOURLY
 \- DAILY
 \- WEEKLY
 \- MONTHLY
 \- CRON
 title: TimeTriggerFrequency
 type: string
 User:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 email:
 type: string
 maxLength: 100
 name:
 type: string
 maxLength: 100
 description: The unique name identifying this account.
 cached\_forks\_count:
 type: integer
 description: A cached version of the forks count. Might not be up to date.
 cached\_forks\_public\_count:
 type: integer
 description: A cached version of the forks count for public agents. Might
 not be up to date.
 cached\_installs\_count:
 type: integer
 description: A cached version of the installs count. Might not be up to
 date.
 cached\_installs\_public\_count:
 type: integer
 description: A cached version of the installs count for public agents. Might
 not be up to date.
 cached\_likes\_count:
 type: integer
 description: A cached version of the likes count. Might not be up to date.
 cached\_likes\_public\_count:
 type: integer
 description: A cached version of the likes count for public agents. Might
 not be up to date.
 is\_operator:
 type: boolean
 description: Whether or not the user is a Guild employee (or operator).
 BE VERY CAREFUL WITH THIS.
 notification\_email\_level:
 type: string
 enum:
 \- NONE
 \- IMPORTANT
 \- ALL
 description: NONE = no emails, IMPORTANT = invitations and agent-ask only,
 ALL = all notification types.
 avatar\_url:
 type: string
 maxLength: 255
 nullable: true
 banner\_url:
 type: string
 maxLength: 255
 nullable: true
 bio:
 type: string
 maxLength: 255
 nullable: true
 closed\_at:
 type: string
 format: date-time
 nullable: true
 description: Set when an operator closes the account. A closed user cannot
 start a login session by any method.
 discord\_url:
 type: string
 maxLength: 255
 nullable: true
 full\_name:
 type: string
 maxLength: 100
 nullable: true
 description: The display name of the account.
 github\_url:
 type: string
 maxLength: 255
 nullable: true
 hubspot\_synced\_at:
 type: string
 format: date-time
 nullable: true
 linkedin\_url:
 type: string
 maxLength: 255
 nullable: true
 threads\_url:
 type: string
 maxLength: 255
 nullable: true
 username\_set\_at:
 type: string
 format: date-time
 nullable: true
 description: Set when the user picks their username during onboarding. Once
 set, the username cannot be changed.
 website\_url:
 type: string
 maxLength: 255
 nullable: true
 x\_url:
 type: string
 maxLength: 255
 nullable: true
 youtube\_url:
 type: string
 maxLength: 255
 nullable: true
 type:
 type: string
 enum:
 \- user
 description: Account type, always "user"
 Workspace:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 creator\_id:
 type: string
 format: uuid
 name:
 type: string
 maxLength: 100
 owner\_id:
 type: string
 format: uuid
 description: The account that owns this entity.
 restrict\_account\_credentials:
 type: boolean
 description: 'When true, tasks in this workspace may not fall back to the
 owning account''s shared credential pool: a resolution that would reach
 the account default is refused so the workspace must rely on credentials
 granted or connected to its agents.'
 should\_restrict\_members:
 type: boolean
 description: When true, only workspace members (plus org admins of the owning
 org) can access this workspace; when false, it is open to the whole owning
 org.
 unlimited\_power\_mode:
 type: boolean
 description: When true, this workspace's execution-tree fan-out limits are
 raised to the platform ceilings instead of the default budgets. The limits
 are raised, not removed. https://i.ibb.co/5XsvmfKg/CFD5-C99-C-B322-46-A2-9892-AFDF484-D28-E1-1.webp
 archived\_at:
 type: string
 format: date-time
 nullable: true
 archived\_by\_id:
 type: string
 format: uuid
 nullable: true
 required\_credentials\_mode:
 type: string
 enum:
 \- SHARED
 \- MEMBER
 nullable: true
 description: 'Whose credentials agents in this workspace may run with: SHARED
 = only org-side credentials serve, MEMBER = only the acting member''s
 own. Unset = no requirement. A workspace agent''s own declaration overrides
 this one.'
 archived\_by: {}
 creator: {}
 full\_name:
 type: string
 description: Full workspace name in format "owner\_name~workspace\_name"
 is\_viewer\_member: {}
 owner:
 $ref: '#/components/schemas/Account'
 unlimited\_power\_mode\_enabled: {}
 WorkspaceAgent:
 type: object
 properties:
 id:
 type: string
 format: uuid
 created\_at:
 type: string
 format: date-time
 updated\_at:
 type: string
 format: date-time
 creator\_id:
 type: string
 format: uuid
 description: The user or API key that added this agent version to the workspace.
 version\_id:
 type: string
 format: uuid
 workspace\_id:
 type: string
 format: uuid
 is\_default\_chat\_agent:
 type: boolean
 description: If True, this workspace agent is used for new chat sessions
 when no explicit agent is provided.
 should\_autoupdate:
 type: boolean
 description: If True, the agent will automatically update when a new version
 is published.
 archived\_at:
 type: string
 format: date-time
 nullable: true
 archived\_by\_id:
 type: string
 format: uuid
 nullable: true
 profile\_name:
 type: string
 maxLength: 100
 nullable: true
 description: Set when this install is an MCP gateway profile, addressed
 as /workspaces//mcp/. Unset on ordinary agent
 installs.
 required\_credentials\_mode:
 type: string
 enum:
 \- SHARED
 \- MEMBER
 nullable: true
 description: 'Whose credentials this agent may run with: SHARED = only org-side
 credentials serve, MEMBER = only the acting member''s own. Unset = the
 workspace''s declaration applies, and no requirement when that is unset
 too.'
 agent:
 $ref: '#/components/schemas/Agent'
 agent\_version:
 $ref: '#/components/schemas/AgentVersion'
 creator:
 $ref: '#/components/schemas/User'
 workspace:
 $ref: '#/components/schemas/Workspace'
 WorkspaceItem:
 description: A workspace as \`\`gen\_serialize\_workspace\`\` emits it.
 properties:
 id:
 format: uuid
 title: Id
 type: string
 entity\_type:
 title: Entity Type
 type: string
 created\_at:
 format: date-time
 title: Created At
 type: string
 updated\_at:
 format: date-time
 title: Updated At
 type: string
 name:
 maxLength: 100
 title: Name
 type: string
 full\_name:
 title: Full Name
 type: string
 owner:
 $ref: '#/components/schemas/AccountItem'
 creator:
 description: 'Whoever created the workspace: a user, an account API key,
 or a trigger key (actor item shape).'
 title: Creator
 nullable: true
 additionalProperties: true
 type: object
 should\_restrict\_members:
 title: Should Restrict Members
 type: boolean
 unlimited\_power\_mode:
 title: Unlimited Power Mode
 type: boolean
 unlimited\_power\_mode\_enabled:
 title: Unlimited Power Mode Enabled
 type: boolean
 restrict\_account\_credentials:
 title: Restrict Account Credentials
 type: boolean
 required\_credentials\_mode:
 title: Required Credentials Mode
 nullable: true
 type: string
 is\_viewer\_member:
 title: Is Viewer Member
 type: boolean
 archived\_at:
 title: Archived At
 nullable: true
 format: date-time
 type: string
 archived\_by:
 nullable: true
 anyOf:
 \- $ref: '#/components/schemas/AccountItem'
 \- nullable: true
 enum:
 \- null
 required:
 \- id
 \- entity\_type
 \- created\_at
 \- updated\_at
 \- name
 \- full\_name
 \- owner
 \- creator
 \- should\_restrict\_members
 \- unlimited\_power\_mode
 \- unlimited\_power\_mode\_enabled
 \- restrict\_account\_credentials
 \- required\_credentials\_mode
 \- is\_viewer\_member
 \- archived\_at
 \- archived\_by
 title: WorkspaceItem
 type: object
 WorkspaceList:
 description: The pagination envelope every collection endpoint returns.
 properties:
 items:
 items:
 $ref: '#/components/schemas/WorkspaceItem'
 title: Items
 type: array
 pagination:
 $ref: '#/components/schemas/PaginationInfo'
 required:
 \- items
 \- pagination
 title: WorkspaceList
 type: object
 \_AttachmentContentPart:
 properties:
 type:
 enum:
 \- image
 \- file
 title: Type
 type: string
 attachment\_id:
 format: uuid
 title: Attachment Id
 type: string
 required:
 \- type
 \- attachment\_id
 title: \_AttachmentContentPart
 type: object
 \_MultimodalContentPart:
 discriminator:
 mapping:
 file: '#/components/schemas/\_AttachmentContentPart'
 image: '#/components/schemas/\_AttachmentContentPart'
 text: '#/components/schemas/\_TextContentPart'
 propertyName: type
 oneOf:
 \- $ref: '#/components/schemas/\_TextContentPart'
 \- $ref: '#/components/schemas/\_AttachmentContentPart'
 \_TextContentPart:
 properties:
 type:
 title: Type
 type: string
 enum:
 \- text
 text:
 title: Text
 type: string
 required:
 \- type
 \- text
 title: \_TextContentPart
 type: object
 securitySchemes:
 apiKey:
 type: http
 scheme: basic
 description: 'Account API key: key id as the username, secret as the password.'