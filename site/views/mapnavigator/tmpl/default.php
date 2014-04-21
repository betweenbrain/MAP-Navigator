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
?>
<section class="map-navigator">
	<ul id="sidebar"></ul>
	<form>
		<ul>
			<?php foreach ($this->categories as $category) : ?>
				<li>
					<label>
						<input class="filters" type="checkbox" name="categories[]" value="<?php echo $category->id ?>"><?php echo $category->name ?>
					</label>
					<?php if ($category->id === $params->get('artistCategory')) : ?>
						<br />
						<label>
							<input type="radio" name="location" value="birth">Born
						</label>
						<label>
							<input type="radio" name="location" value="primary" checked>Works
						</label>
					<?php endif ?>
				</li>
			<?php endforeach ?>
		</ul>
	</form>
	<form>
		<label>
			<input type="radio" name="region" class="global" value="" checked>Global
		</label>
		<?php foreach ($this->regions as $region) : ?>
			<label>
				<input type="radio" name="region" class="global" value="<?php echo $region->id ?>"><?php echo $region->name ?>
			</label>
		<?php endforeach ?>
	</form>
</section>

<div id="map-canvas"></div>
