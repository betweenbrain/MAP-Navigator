<?php defined('_JEXEC') or die;

/**
 * File       default.php
 * Created    4/9/14 11:09 AM
 * Author     Matt Thomas | matt@betweenbrain.com | http://betweenbrain.com
 * Support    https://github.com/betweenbrain/
 * Copyright  Copyright (C) 2014 betweenbrain llc. All Rights Reserved.
 * License    GNU GPL v2 or later
 */
$params = & JComponentHelper::getParams('com_mapnavigator');
$half = floor(count($this->categories) / 2);
?>
<section class="map-navigator">
	<div class="panel">
		<ul id="sidebar"></ul>
		<form id="filters">
			<ul>
				<?php foreach ($this->categories as $index => $category) : ?>
				<?php if ($index == $half) : ?>
			</ul>
			<ul>
				<?php endif ?>
				<li class="<?php echo $category->alias ?>">
					<label>
						<input class="filters" type="checkbox" name="categories[]" value="<?php echo $category->id ?>"><?php echo $category->name ?>
					</label>
					<?php if ($category->id === $params->get('artistCategory')) : ?>
						<div class="toggle-btn-group clearfix">
							<input id="birth" type="radio" name="location" value="birth">
							<label for="birth">Born</label>
							<input id="primary" type="radio" name="location" value="primary" checked="checked">
							<label for="primary">Works</label>
						</div>
					<?php endif ?>
				</li>
				<?php endforeach ?>
			</ul>
		</form>
	</div>
	<form id="toolbar">
		<label class="global" title="All Regions">
			<input type="radio" name="region" value="">Global
		</label>
		<?php foreach ($this->regions as $region) : ?>
			<label class="<?php echo $region->alias ?>" title="<?php echo $region->name ?>">
				<input type="radio" name="region" value="<?php echo $region->id ?>"><?php echo $region->name ?>
			</label>
		<?php endforeach ?>
	</form>
</section>
<div id="map-canvas"></div>
