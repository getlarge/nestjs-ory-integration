FROM oryd/hydra:v2.2.0

COPY ./hydra.yaml /home/ory/hydra.yaml

HEALTHCHECK --interval=3s --timeout=3s --start-period=2s --retries=3 CMD [ 'wget -nv --spider -t1 http://localhost:4444/health/ready || exit 1' ]

CMD ["serve", "--config", "/home/ory/hydra.yaml",  "all" "--dev"]
