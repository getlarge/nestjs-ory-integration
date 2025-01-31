FROM getlarge/keto:v0.13.0

COPY ./keto.yaml /home/ory/keto.yaml
COPY ./namespaces.ts /home/ory/namespaces.ts

HEALTHCHECK --interval=3s --timeout=3s --start-period=2s --retries=3 CMD [ 'wget -nv --spider -t1 http://localhost:4466/health/ready || exit 1' ]

CMD ["serve", "--config", "/home/ory/keto.yaml"]
