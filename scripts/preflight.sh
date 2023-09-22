#!/bin/sh
set -e
supervisorctl start node
supervisorctl start nginx