# Security Policy

Conduit adheres to strict credential management and security practices to ensure player safety and protect third-party API integrity.

## Reporting a Vulnerability
If a vulnerability or security flaw is discovered in the application architecture, please report it directly via Discord to ensure it is addressed before public exploitation.
**Contact:** [_deep4wee¿](https://discord.com/users/647429661587931178)

---

## API Security & Credentials Architecture

As an open-source project, Conduit strictly follows secure credential management practices to prevent API key leakage while remaining fully forkable for the community. The project employs a **Tiered Security Model** depending on the nature of the API:

### 1. Public Identifiers (Microsoft OAuth Client ID)
*   **Architecture:** Build-Time Injection + XOR Fallback
*   **Context:** Desktop applications operate as "Public Clients" in OAuth 2.0. The Client ID is inherently public, but it is obfuscated in the repository to prevent automated GitHub scrapers from flagging or misusing it.
*   **Mechanism:** The CI/CD pipeline injects the official Microsoft Client ID via environment variables during compilation. For local community development, developers can utilize a `secrets.local.json` file (ignored by Git) or rely on a built-in neutralized fallback ID to evaluate the software.

### 2. Private API Keys (CurseForge, Paid APIs)
*   **Architecture:** Serverless Reverse Proxy Gateway
*   **Context:** Embedding private API keys inside a compiled binary or an open-source repository is a fundamental security flaw, as keys can be extracted via decompilation.
*   **Mechanism:** The Conduit client **never** communicates directly with CurseForge or restricted APIs. Instead, requests are routed to a lightweight Serverless Gateway (e.g., Cloudflare Worker). The gateway securely holds the actual API keys in its environment variables, appends them to outgoing headers, and proxies the traffic. This ensures zero risk of key theft and allows centralized rate-limiting or access revocation.

## User Data Protection

*   **No Plaintext Storage:** Conduit does not store user passwords.
*   **OS-Level Encryption:** Authentication tokens (such as Modrinth API keys or Microsoft session tokens) are encrypted at rest using the Operating System's Data Protection API (DPAPI on Windows). Tokens cannot be deciphered if the configuration file is transferred to another machine.
*   **Official OAuth:** Microsoft authentication is conducted entirely through official Microsoft Live web views using MSAL, ensuring the application never intercepts keystrokes or password data.