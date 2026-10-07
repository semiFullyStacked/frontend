FROM ubuntu:latest
LABEL authors="David"

ENTRYPOINT ["top", "-b"]