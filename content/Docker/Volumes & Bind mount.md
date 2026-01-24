# Volumes
- Docker volume is the recommended way to store data created and utilized by containers.
- Since container layer is non-persistent, we use volumes to persist that data
	`docker volume create my-volume`
- When mounting a volume, we have to specify the source (volume) and destination path in the image.
	`docker run -it -v my-volume:/my-data ubuntu:22.01`
- A volume can be used by multiple containers at the same time

# Bind mount
- Instead of volumes, we can also bind a file or directory on the host computer to the image.
- They are not recommended because the isolated process interacts with the host computer.