---
title: "A London data centre loses power, and the backup generators never start"
date: "2026-10-20"
time: "about 2:00–8:08 a.m. US Eastern (7:00 a.m.–1:08 p.m. in London)"
where: "Google Cloud, europe-west2 (London)"
kind: accident
category: hardware
visible: "The cloud as a building with two power cables, a generator plant and five minutes of batteries, and the banks, couriers and courts that sit on top of it."
cause: "Per Google's incident report (Nov 4): an underground cable fault on the utility network outside the building, while the second power feed was already open for repairs; then a \"misconfiguration of the PLC logic\" kept the generators from starting, and the batteries lasted about five minutes."
sources:
  - "https://status.cloud.google.com/incidents/Xs2XTHzAVC9YnafnPyzj"
  - "https://www.theregister.com/paas-and-iaas/2026/10/20/google-cloud-says-a-power-event-caused-todays-outage/5304160"
---
One zone of Google Cloud's London region went dark for about six hours, and the two other London zones were hit as well: about 40 products, from virtual machines to databases. Customers reported problems at Revolut (card payments and ATM withdrawals), Lloyds, HSBC and Royal Mail. Every backup was in place on paper: two power feeds, generators, batteries. They failed one after another. This was three weeks before the window of this page; it is here because it shows how a backup can be the thing that breaks. Star, on infrastructure that becomes visible upon breakdown: "Even when there are back-up mechanisms or procedures, their existence further highlights the now-visible infrastructure."
