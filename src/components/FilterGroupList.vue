<template>
	<div class="filter-group-list">
		<h2>
			<i class="fa fa-tag" />
			{{title}}
		</h2>
		<ul class="no-liststyle tags-list">
			<li
				@click="onRemoveTagFrom(item)"
				v-for="(item) in disabledTags"
				:key="item.id"
				class="clickable u-box u-box--align-center tags-list-item tags-list-item--active"
			>
				<span class="tag-id">
					<i class="fas fa-window-close"></i>
				</span>
				<strong class="tag-name">{{item.name}}</strong>
			</li>
		</ul>
		<ul class="no-liststyle tags-list tags-available">
			<li
				@click="onAddTagTo(item)"
				v-for="(item, index) in availableTags"
				:key="item.id"
				class="clickable u-box u-box--align-center tags-list-item"
			>
				<span class="tag-id">{{index + 1}}</span>
				<strong class="tag-name">{{item.name}}</strong>
			</li>
		</ul>
	</div>
</template>

<script>
export default {
	name: 'FilterGroupList',
	props: {
		title: {
			type: String
		},
		// Lists
		disabledTags: {
			type: Array,
			default: () => []
		},
		availableTags: {
			type: Array,
			default: () => []
		},
		// Events
		onRemoveTagFrom: {
			type: Function,
			required: true
		},
		onAddTagTo: {
			type: Function,
			required: true
		}
	}
}
</script>

<style lang="scss">
.filter-group-list {
	h2 {
		margin-top: unset;
	}
}

.clickable {
	cursor: pointer;
}
.tags-list {
	&.tags-available {
		li {
			display: inline-block;
			word-break: break-all;
			white-space: pre;
			padding: 2px 8px;
		}
	}
	&-item {
		margin-bottom: 1px;

		&:hover {
			background-color: #30d0d038;
			color: #30cfd0;
		}

		&--active {
			background-color: #30cfd0;
		}

		.tag {
			&-id {
				margin-right: 8px;
				width: 40px;
				text-align: center;
			}
		}
	}
}
.no-liststyle {
	list-style: none;
	padding-left: unset;
}
</style>
