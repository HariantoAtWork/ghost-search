<template>
	<div class="ghost-search-posts" :class="styleTags">
		<header class="ghost-search-posts__header u-box u-relative">
			<div class="publishedAt">{{ post.published_at | fromNow }}</div>
			<h1 class="ghost-search-posts__title u-flex" :title="post.title">
				<a :href="post.url">{{ post.title }}</a>
			</h1>
			<button class="ghost-search__button" @click="toggleDrawer">
				<i class="fa" :class="{ 'fa-window-maximize': !show, 'fa-window-minimize': show }"></i>
			</button>
		</header>

		<div class="ghost-search-posts__excerpt">
			<div class="coverimage" v-if="post.feature_image">
				<img class="coverimage__img" :src="post.feature_image" :alt="post.title" />
			</div>

			<p class>{{ post.custom_excerpt || post.excerpt }}</p>
		</div>
	</div>
</template>

<script>
import dayjs from '../lib/dayjs'

const fromNow = value => {
	const publishedAt = dayjs(value)
	const diff = publishedAt.diff(dayjs().subtract(1, 'year'))
	if (diff <= 0)
		return publishedAt.fromNow() + ' • ' + publishedAt.format('D MMM YYYY')
	return publishedAt.fromNow()
}

export default {
	name: 'GhostSearchPosts',
	props: {
		post: {
			type: Object,
			required: true,
			default: () => ({})
		}
	},
	data: () => ({
		show: false
	}),
	computed: {
		styleTags() {
			const list =
				[
					this.show ? 'ghost-search-posts--show' : this.show,
					...this.post.tags.map(({ slug }) => 'tag--' + slug)
				].filter(Boolean) || []
			return list
		}
	},
	filters: {
		fromNow(value) {
			return fromNow(value)
		}
	},
	methods: {
		toggleDrawer() {
			this.show = !this.show
		}
	}
}
</script>

<style lang="scss" scoped>
.ghost-search-posts {
	// position: relative;
	background-color: rgba(0, 0, 0, 0.527);
	padding: 4px;
	padding-top: 12px;
	margin-top: 14px;
	margin-bottom: 4px;
	margin-left: 1px;
	margin-right: 2px;
	border-radius: 4px;
	font-family: 'proxima-nova-1', sans-serif;
	&:after {
		content: '';
		display: table;
		clear: both;
	}
	&__title {
		font-size: 18px;
		background: linear-gradient(180deg, #0fb8ad 0, #1fc8db 51%, #2cb5e8 75%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		margin-top: 4px;
		margin-bottom: 0;
		padding: 0;

		.tag--journal & {
			color: #0fb8ad;
			background: unset;
			-webkit-text-fill-color: unset;

			a {
				color: inherit;
				text-decoration: inherit;

				&:visited {
					color: inherit;
				}
			}

			&:after {
				content: ' (Journal)';
				font-style: italic;
				color: rgba(255, 255, 255, 0.753);
				font-size: 0.8em;
			}
		}

		.tag--draft & {
			color: orangered;
			background: unset;
			-webkit-text-fill-color: unset;

			a {
				color: inherit;
				text-decoration: inherit;
			}

			&:after {
				content: ' (Draft)';
				font-style: italic;
				color: rgba(255, 255, 255, 0.753);
				font-size: 0.8em;
			}
		}
	}

	&:not(.ghost-search-posts--show) > .ghost-search-posts__excerpt {
		display: none;
	}

	&__header {
	}

	&__excerpt {
		// display: none;
		font-size: 16px;
		line-height: 1.6em;
		word-wrap: break-word;
		overflow: hidden;
		@media only screen and (max-width: 600px) {
			word-break: break-all;
		}

		.coverimage {
			max-width: 200px;
			float: left;
			margin-right: 8px;
		}
		p {
			margin-top: 0;
			&:last-of-type {
				margin-bottom: 0;
			}
		}
	}
	.ghost-search__button {
		width: 40px;
		height: 40px;
		margin-top: -8px;
		margin-right: 0;
		margin-bottom: 0;
		margin-left: 0;
		padding: 0;
		background-color: rgba(0, 0, 0, 0.3);
		border-radius: 4px;
		color: white;
		border: 0;
	}

	.publishedAt {
		position: absolute;
		top: -20px;
		// left: 50%;
		// transform: translateX(-50%);
		background-image: linear-gradient(
			0deg,
			rgba(0, 0, 0, 0) 0%,
			rgba(0, 0, 0, 0.7) 100%
		);
		color: rgba(255, 255, 255, 0.753);
		border-radius: 4px;
		font-size: 12px;
		font-weight: 400;
		line-height: 1em;
		padding: 4px 8px;
		margin: 0;
	}

	.coverimage {
		position: relative;
		overflow: hidden;
		box-sizing: border-box;
		background-color: hotpink;
		width: 100%;
		&:after {
			content: '';
			visibility: hidden;
			display: block;
			clear: both;
			height: 0;
			box-sizing: border-box;
			padding-bottom: 75%;
		}

		.coverimage__img {
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
			display: block;
			object-fit: cover;
			width: 100%;
			height: 100%;
			border: 0;
			vertical-align: middle;
		}
	}
}
</style>
