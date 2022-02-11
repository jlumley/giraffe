docker run  -d -p 80:80 -e APP_MODE="DEV" -e API_ONLY="true" --name giraffe-budget-test  giraffe-budget

for test_file in tests/*tests.py;
do
  python $test_file
done;

docker rm -f giraffe-budget-test
