FROM oryd/kratos:v1.1.0

COPY ./kratos.yaml /home/ory/kratos.yaml
COPY ./identity.schema.json /home/ory/identity.schema.json

HEALTHCHECK --interval=3s --timeout=3s --start-period=2s --retries=3 CMD [ 'wget -nv --spider -t1 http://localhost:4433/health/ready || exit 1' ]

CMD ["serve", "--config", "/home/ory/kratos.yaml", "--dev"]
