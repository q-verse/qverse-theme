#####################################################################
# Make file configs
#####################################################################

.PHONY: help clean fix-quality sandbox test-js test-sass test-quality test-requirements
.DEFAULT_GOAL := help

######################################################################


######################################################################
# Management and Utility targets
######################################################################

help: ## Display this help message.
	@echo "Please use \`make <target>\` where <target> is one of"
	@grep -E '^[a-zA-Z_-.]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; \
	{printf "\033[36m%-40s\033[0m %s\n", $$1, $$2}'

clean: ## Remove all the node_modules.
	rm -rf node_modules

fix-js-quality: ## Run the eslint-fixer, sass-lint-auto-fix.
	npm run fix-js

sandbox: test-requirements ## Local Setup.

######################################################################


######################################################################
# Testing targets
######################################################################

test-js: ## Run the eslint.
	npm run test-js

test-sass: ## Run the sass-lint.
	npm run test-sass


test-quality: test-js test-sass ## Run the quality tests.

######################################################################


######################################################################
# Requirement installation targets
######################################################################

test-requirements: ## Installs all dependencies for testing.
	npm install

######################################################################
