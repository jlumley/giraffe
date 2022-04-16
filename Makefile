help: ## show help message
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m\033[0m\n"} /^[$$()% a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

build: ## build docker image
	docker build . -t giraffe-budget

dev: ## run container interactively
	docker run --rm -it -v /tmp/giraffe-budget/data:/data -v /tmp/giraffe-budget/logs:/logs -p 80:80 -e APP_MODE="DEV" --name giraffe-budget-dev  giraffe-budget /bin/sh -c /src/bin/start.sh


dev-api: ## run only api
	docker run --rm -d -v /tmp/giraffe-budget/data:/data -v /tmp/giraffe-budget/logs:/logs -p 80:80 -e APP_MODE="DEV" -e API_ONLY="true" --name giraffe-budget-dev  giraffe-budget /bin/sh -c /src/bin/start.sh

clean: ## cleanup after dev instance
	docker rm -f giraffe-budget-dev && rm -rf /tmp/giraffe-budget

test:
	docker run -it --rm -e APP_MODE="TEST" --name giraffe-budget-test  giraffe-budget python -m pytest -v
