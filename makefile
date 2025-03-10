github:
	-git commit -a
	git push origin main

all_tests:
	npx jest

cloud:
	./cloud.sh

local:
	./local.sh
