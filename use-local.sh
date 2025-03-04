#!/bin/bash
export REACT_APP_URL_PRE="http://localhost:8000"
echo "Using local backend: $REACT_APP_URL_PRE"
env REACT_APP_URL_PRE=$REACT_APP_URL_PRE npm start
