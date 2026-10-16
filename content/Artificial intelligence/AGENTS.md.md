## https://agents.md/

AGENTS.md is an open format which is universally accepted by all the harnesses. It is meant for global instructions to be written into it for steering the behavior of the agent and providing it with conventions to be followed while working on a particular repository or, in general, any workflow. 

Depending on the harness the agents.md content can be added to the system prompt or the user prompt but usually it makes sense for it to be added to the user prompt. 

When you are working in a repository in a harness such as Claude Code or Codex, the harness will first look for agents.md at the root directory or the home directory of the file system. It will then load that into the user prompt for the LLM call at the start of the session.

Depending on which file is being worked on, the nearest agents.md (basically all the agents.md up to that file path) will be appended to the user prompt. A separate agents.md file can be added to each repository and each subdirectory of the repository for path scoped rules. In case of any conflicting information the LLM is usually trained to accept what is present in the agents.md nearest to the file path. 

> [!note] the agents.md which are present in the subdirectories are not added if the file being read is outside that directory. 



