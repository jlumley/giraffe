help: ## show help message
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m\033[0m\n"} /^[$$()% a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

dev: ## run container interactively
	make test && docker run --rm -it -v /tmp/giraffe-budget/data:/data -v /tmp/giraffe-budget/logs:/logs -p 9980 -e APP_MODE="DEV" --name giraffe-budget-dev ghcr.io/jlumley/giraffe-budget:latest   /bin/sh -c /src/bin/start.sh


dev-api: ## run only api
	make clean && make test && docker run --rm -d -v /tmp/giraffe-budget/data:/data -v /tmp/giraffe-budget/logs:/logs -p 9980:80 -e APP_MODE="DEV" -e API_ONLY="true" --name giraffe-budget-dev ghcr.io/jlumley/giraffe-budget:latest  /bin/sh -c /src/bin/start.sh

clean: ## cleanup after dev instance
	docker rm -f giraffe-budget-dev && rm -rf /tmp/giraffe-budget

test:
	make build && docker run --rm -e APP_MODE="TEST" --name giraffe-budget-test  ghcr.io/jlumley/giraffe-budget:latest python -m pytest -v


build: ## build docker image
	docker build . -t ghcr.io/jlumley/giraffe-budget:latest
 
publish:  ## publish docker image to ghcr
	make test && docker push ghcr.io/jlumley/giraffe-budget:latest


