> [!info] AI agents are piece of softwares which make use of an Artificial Intelligence model to get a certain task done. 

An agent consists of the following components :-

1. AI model = An AI model call has to be made in the agentic pipeline. The model can be of many types depending on the use case. Usual parameters measured while choosing a model are -
	1. Speed
	2. Quality
	3. [[Context window]]
	4. Cost
	5. Tool calling
	6. Streaming capabilities
	7. Prompt caching support
2. [[Agentic memory]] = It decides what information a model remembers while doing its job and what information is propagated to the AI model. Memory is essential for providing context to the model for the desired output. Memory can be of different types - 
	1. Working memory - the context which is stored short term for a particular session
	2. Semantic memory - Semantic memory includes facts usually stored in [[Artificial intelligence/AGENTS.md.md|AGENTS.md]], file based knowledge base or even a RAG system with [[Vector database]]. This memory is available to all the sessions of the agent.
	3. Procedural memory - The memory which contains instructions for the LLM for certain tasks ([[Artificial intelligence/SKILLS.md.md|SKILLS.md]] files)
	4. Episodic memory - Episodic memory contains past events/history usually extracted from the sessions. (example includes LLM driven storage of a certain event)
3. [[Harness]] = It is the actual piece of software which drives an agent end-to-end and integrates components such as tools, agentic memory, and AI models. The harness is responsible for orchestrating the whole agentic pipeline and the pipeline can include multiple AI models, different types of databases, memory systems and tools. The harness is the one that actually makes the LLM API call, provides it with the required context, and also invokes tools asked for by the model.  
4. Tools =  Tools are the arms and legs of an agent. They provide the LLM with the capability to integrate with external or internal systems and do actual work. Tools are functions which an LLM can call and execute any code. Tasks can vary from interacting with the memory systems to making external API calls and even driving robotic systems. MCP tools, SKILL loading, Client tools are all part of the same mechanism. 
   
   > [!note]  The LLM only asks for a tool invocation in its output but the harness is the one which actually invokes the piece of code