---
title: Shaurya Mehta
layout: index
description: Full-stack, applied AI engineer building agentic systems that use tools, remember and act, with DevOps and security depth and the notes to show how it all works.
# the home page's scroll story (HomeBeats); the note below is the reading panel
home:
  headline: Full-stack engineer building agents that use tools, remember and act.
  tagline: Agentic AI · Full stack · DevOps · Security
  quote: "I build agents: systems that use tools, hold context, remember and act on someone's behalf."
  label: I take systems apart to understand why they work.
  # the handwritten note under the panel, shown when the ink cursor is on
  brush: every system has another side. paint to find it.
  # the spiral of folders at the end of the page
  outro:
    tag: Keep exploring
    headline: From the model to the cluster.
    text: Agents, the stack under them and the pipelines that ship them. Pick a painting to read how each part works.
---

> [!quote] My Engineering Philosophy
> I believe an engineer is a problem solver who should be capable of addressing any type of challenge they encounter. My approach is centered on deconstructing the **"why"** and **"what"** of every system to understand it inside out. By identifying architectural **patterns**, I can solve complex problems more efficiently and adapt to new technologies quickly.

---

## Who I Am

I'm an engineer with 1.5 years of experience building AI and full-stack systems. I specialize in agentic applied AI: conversational voice AI, coding agents, multi-agent systems, research and workflow automation agents, evaluation pipelines, and the infrastructure that makes them reliable, measurable and fast. I also work across full-stack engineering, DevOps and security.

I'm currently at The Product Highway, building production AI agents: systems that use tools, hold context, remember and act on someone's behalf. I care about measuring them as much as building them. Some of what I've built:

- **Porter AI.** A voice-and-text shopping agent wired into a live storefront. It calls server tools for product, variant, warranty and shipping data, and client-side actions that reveal page sections and navigate shoppers, working from live page, cart and dwell context and starting conversations with proactive nudges.
- **Alfred-OS.** A voice-controlled macOS agent that routes commands to browser and desktop agents, runs them as background tasks, and asks for spoken confirmation before anything destructive.
- **Office AI memory.** A memory system for coding agents that I built on SQLite and serve over MCP. Agents search, read and edit versioned knowledge, every write runs its own checks, and conflicting edits are refused, so each fact has one owner. It replaced a markdown knowledge base and now holds the project knowledge for Porter and VoiceFlow.
- **MCP servers.** One that connects agents to JIRA, Confluence and GitLab for sprint automation and generated documentation, and the memory server above.
- **Evals as a feedback loop.** An LLM answer evaluator grades each Porter reply against fresh product data, and an analytics dashboard shows the business how the agent is performing.
- **Faster agents.** I cut voice-agent reply latency by about 45% on real traffic by moving the backend next to the services it calls, then added tool caching and fixed truncated tool calls. I also fine-tuned a small GLiNER model to predict which tools the agent will need before the LLM asks, so results are ready in time: exact tool selection went from 0/50 to 18/50, and LLM calls per step fell 42% in a controlled test.

I build the whole thing, not just the model. That means Next.js and React Native front ends, FastAPI, Spring Boot and Kotlin back ends, and the pipelines that ship them, like the CI/CD on Kubernetes that cut release time by 60%.

Before that I spent a year at SBS, in fintech, building Open Banking APIs secured with HSM-managed keys, JWE encryption, OAuth and mTLS under PSD2, Wero and QWAC/QSEAL compliance. I also worked in a forward-deployed capacity: when client meetings surfaced bugs, I was the one who took them on, gave quick answers and shipped quick fixes, and at delivery time I turned my debugging into hotfixes. On the DevOps side, I designed CI/CD pipelines and deployments with GitLab CI/CD, Docker, Helm, Kubernetes and AWS.

Security stays part of how I think about software, and it shows up in how I build agents too: they confirm before anything destructive, and every action a model asks for is validated first.

I'm a problem solver and a passionate engineer. I like taking a system apart to understand why it works, learning new tools by building real things with them, and following a problem from the infrastructure all the way up to the product. The notes below are the working record: AI, system design, security, Kubernetes, Docker and more.

---

## My Toolkit

| Category                  | Technologies                                                                                                                                                                                                                                                                                                 |
| :------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AI and Agents**         | Agentic workflows, tool calling, MCP servers, agent orchestration, agent memory, context engineering, human-in-the-loop and guardrails, evals and LLM-as-judge, RAG, vector databases, LangChain, Claude Code, Codex, conversational voice AI (streaming STT and TTS pipelines, latency tuning), fine-tuning |
| **Programming Languages** | Python, TypeScript, Java, Go, Kotlin, JavaScript, SQL, C++, C                                                                                                                                                                                                                                                |
| **Backend**               | FastAPI, Spring Boot, Spring Security, Gin, NestJS, MedusaJS, RESTful APIs, gRPC, GraphQL, WebSockets, Postgres, MongoDB, Redis                                                                                                                                                                              |
| **Frontend**              | React.js, Next.js, React Native (Expo), Electron, Redux, TanStack Query, HTML5, CSS3, Tailwind CSS                                                                                                                                                                                                           |
| **DevOps**                | Kubernetes (StatefulSets, Services, Networking), Docker, Helm, GitLab CI/CD, GitHub Actions, Terraform, AWS, Linux, Nginx, Database Replication, Grafana, InfluxDB                                                                                                                                           |
| **Security**              | HSM, JWE, OAuth 2.0 + mTLS, JWT, Keycloak, TLS, cryptography, QWAC and QSEAL compliance                                                                                                                                                                                                                      |
| **Soft Skills**           | Leadership, Abstract Thinking, Team Collaboration, Documentation, Management                                                                                                                                                                                                                                 |

---

[**GitHub**](https://github.com/Shaurya-GitH) | [**LinkedIn**](https://www.linkedin.com/in/shaurya-mehta-0b916a349/) | [**X**](https://x.com/ShauryaCODE) | [**LeetCode**](https://leetcode.com/ShauryaLC)
