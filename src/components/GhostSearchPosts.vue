<template>
	<div class="ghost-search-posts" :class="{'ghost-search-posts--show': show}">
		<header class="u-box u-relative">
			<div class="publishedAt">{{ post.published_at | fromNow }}</div>
			<h1 class="ghost-search-posts__title u-flex" :title="post.title">
				<a :href="post.url">{{ post.title }}</a>
			</h1>
			<button class="ghost-search__button" @click="toggleDrawer">
				<i class="fa" :class="{'fa-window-maximize': !show, 'fa-window-minimize': show}"></i>
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
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

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
	filters: {
		fromNow(value) {
			return dayjs(value).fromNow()
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
	}

	&:not(.ghost-search-posts--show) > .ghost-search-posts__excerpt {
		display: none;
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
			max-width: 150px;
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
		background-color: transparent;
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
}
</style>