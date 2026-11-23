---
title: "An AI coding agent publishes a password, and customers' prompts leak"
date: "2026-11-21"
time: "disclosed Nov 21"
where: "Together AI"
kind: accident
category: hack
visible: "AI agents as workers inside the company, with the same access, and the same ability to make an expensive mistake, as the engineers they help."
cause: "Per Together AI: while it was developing a public code repository, \"an AI coding agent committed a credential that provided access to the private Hugging Face repository\" where samples of customers' requests were stored."
sources:
  - "https://www.together.ai/blog/security-event-prompt-leakage-for-requests-in-june-and-july-of-2026"
---
Someone used the leaked credential to download stored samples of customers' prompts from June and July, searched them for passwords and tried those out, including some of Dragos's bait. Together AI made zero data retention the default for new accounts and changed how it lets AI coding agents work.
