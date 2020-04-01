# ghost-search

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

```html
<meta charset="utf-8">
<title>ghost-search-async demo</title>
<script src="https://unpkg.com/vue"></script>
<script src="./ghost-search-async.js"></script>


<ghost-search-async
  script="https://unpkg.com/@tryghost/content-api@1.3.9/umd/content-api.min.js"
  url="https://blog.ghost.localhost"
  ghost-key="c3426374501bcd41a801c5a74a"
  version="v3"></ghost-search-async>
```
> `url` and `ghost-key` are required