---
title: "Researchers' bait shows hackers reading prompts sent to AI models"
date: "2026-11-19"
time: "theft in late October; report published Nov 19"
where: "AI model-hosting companies, via OpenRouter"
kind: accident
category: hack
visible: "The chain of small companies that actually run the AI models people call, and the promise that your prompts aren't kept."
cause: "Attackers had broken into at least three companies that host AI models. One, Phala, said a GPU server was compromised and told customers to treat requests from Oct 21 to Nov 8 as exposed. The providers didn't notice until the researchers told them."
sources:
  - "https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens"
  - "https://openrouter.ai/blog/announcements/data-processing-incidents-on-inference-providers/"
  - "https://www.securityweek.com/ai-inference-providers-failed-to-detect-hacking-and-prompt-theft-says-dragos/"
---
The security firm Dragos sent about two million prompts with fake passwords hidden in them to AI model providers. Some of the fakes were stolen and tried: "every request we sent during those windows was stolen." OpenRouter, the service that routes requests to these providers, "off-boarded three providers" and removed 125 endpoints from its zero-data-retention list.
