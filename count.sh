#!/bin/bash

count=0

goDir() {
	DIR_NAME="$1"
	cd "$DIR_NAME" || return
	for FILE in *.js *.ejs; do
		if [[ -f $FILE ]]; then
			nr=$(wc -l <"$FILE")
			((count += nr))
		fi
	done

	for DIR in */; do
		if [[ -d $DIR && $DIR != "node_modules/" ]]; then
			goDir "$DIR"
			cd ..
		fi
	done
}

main() {
	for FILE in *.js *.ejs; do
		if [[ -f $FILE ]]; then
			nr=$(wc -l <"$FILE")
			((count += nr))
		fi
	done

	for DIR in */; do
		if [[ -d $DIR && $DIR != "node_modules/" ]]; then
			goDir "$DIR"
			cd ..
		fi
	done
}

main

echo "$count"
