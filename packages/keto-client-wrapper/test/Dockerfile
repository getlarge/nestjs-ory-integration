FROM getlarge/keto:v0.13.0

COPY ./keto.yaml /home/ory/keto.yaml
COPY ./namespaces.ts /home/ory/namespaces.ts

HEALTHCHECK --interval=30s --timeout=3s --start-period=2s --retries=3 CMD ["keto", "status", "--insecure-disable-transport-security", "--quiet"]

CMD ["serve", "--config", "/home/ory/keto.yaml"]
