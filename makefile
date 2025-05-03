github:
	-git commit -a
	git push origin main

all_tests:
	npm run test -- --silent || npx jest --silent


cloud:
	./cloud.sh

local:
	./local.sh
