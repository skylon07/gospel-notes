username = skylon07
appname = gospel-notes
containername = gospel-notes-web
nmvolumename = $(appname)-nodemodules

build:
	docker build -t $(username)/$(appname) .

run: build
	if ! docker volume ls | grep -q $(nmvolumename); then \
		docker volume create --name $(nmvolumename); \
	fi
	docker run \
		--rm \
		--name $(containername) \
		-p 3000:3000 \
		-v `pwd`:/usr/src/gospel-notes \
    	-v nodemodules:/usr/src/gospel-notes/node_modules \
		$(username)/$(appname)

stop:
	docker stop $(containername)

shell:
	docker exec -it $(containername) /bin/sh
