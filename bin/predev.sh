#!/usr/bin/env bash

function searchForDatabasePath {
	if [[ -f .env ]]; then
		return
	fi

	# Attempt to find the first file with a .sqlite extension
	# in a parent directory.  Warning!
	echo "# Searching for DATABASE_PATH to add to .env file"

	local cwd="$(pwd)"
	DATABASE_PATH=
	while [[ -z $DATABASE_PATH && ${#cwd} -gt 1 ]]; do
		DATABASE_PATH="$(ls -t "${cwd}"/*.sqlite)"
		cwd="$(dirname "${cwd}")"
	done
	echo "DATABASE_PATH=$DATABASE_PATH" > .env
}

function configureNGINX {
	echo "# Configuring NGINX (if necessary)"
	local expectedContainerName="${OBJCEO_NGINX_CONTAINER_NAME:-objectiveceo_nginx}"

	local containers="$(docker container ls --all --filter "name=${expectedContainerName}")"
	local lineCount="$(echo "${containers}" | wc -l)"
	if [[ $lineCount -eq 1 ]]; then
		echo "Creating container named ${expectedContainerName}"
		docker create \
			--name "$expectedContainerName" \
			--publish 80:80 \
			--volume "$(pwd)/static/":"/static/" \
			nginx:alpine
	fi

	docker ps --filter status=running | grep "$expectedContainerName" > /dev/null
	if [[ $? -ne 0 ]]; then
		echo "Copying conf file into ${expectedContainerName}"
		docker cp nginx/objectiveceo.local.conf "$expectedContainerName":/etc/nginx/conf.d/

		echo "Starting ${expectedContainerName}"
		docker start "$expectedContainerName" > /dev/null
	fi
}

function main {
	## Assume having a .git, src, and nginx is good enough
	if [[ ! -d .git && ! -d src && ! -d nginx ]]; then
		echo "predev.sh is expected to be run from the root of the coordinator repo"
		exit -1
	fi

	searchForDatabasePath
	configureNGINX
}

main "$@"
