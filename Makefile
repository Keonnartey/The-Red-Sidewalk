install:
	pip install --upgrade pip &&\
		pip install -r requirements.txt &&\
		pip install pylint

format:	
	black *.py 
lint:
	if ls *.py 1> /dev/null 2>&1; then \
		pylint --disable=R,C --ignore-patterns=test_.*?py *.py; \
	else \
		echo "No Python files to lint."; \
	fi

container-lint:
	docker run --rm -i hadolint/hadolint < Dockerfile

refactor: format lint

deploy:
	#deploy goes here
		
all: install lint test format deploy
