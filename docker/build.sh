sh docker/build-local.sh
version=$(cat version)
# branch=$(git branch | grep \* | cut -d ' ' -f2)
# branch=$(git branch | grep \* | cut -d ' ' -f2 | sed 's/[^a-zA-Z0-9._-]/_/g')
# docker push udsmdhis2/icare-core:local
if [ -n "$GITHUB_HEAD_REF" ]; then
  branch="$GITHUB_HEAD_REF"
else
  branch="${GITHUB_REF##*/}"
fi
safe_branch=$(echo "$branch" | sed 's/[^a-zA-Z0-9._-]/_/g')

docker push udsmdhis2/icare-core:$safe_branch-$version
# docker push udsmdhis2/icare-core:$branch-$version
