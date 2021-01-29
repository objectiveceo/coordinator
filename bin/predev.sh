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

function main {
	## Assume having a .git, src, and nginx is good enough
	if [[ ! -d .git && ! -d src && ! -d nginx ]]; then
		echo "predev.sh is expected to be run from the root of the coordinator repo"
		exit -1
	fi

	searchForDatabasePath
}

main "$@"
