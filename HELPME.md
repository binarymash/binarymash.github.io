# Notes to self....

## Adding posts and testing locally

Note: I'm building this locally on WSL. 

Add new content, then build the site...

```bash
bundle exec jekyll build
```

The new post should now be visible on the filesystem under _site.

We can test how this looks for real by running the site locally:

```bash
bundle exec jekyll serve
```

## To publish

Commit to master and push up. There are github actions that build and deploy.

## Maintenance

See https://pages.github.com/versions/ for supported package dependencies. To update in the repo run

```bash
bundle update github-pages
```