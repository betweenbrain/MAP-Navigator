<?php defined('_JEXEC') or die;

/**
 * File       default.php
 * Created    4/9/14 11:09 AM
 * Author     Matt Thomas | matt@betweenbrain.com | http://betweenbrain.com
 * Support    https://github.com/betweenbrain/
 * Copyright  Copyright (C) 2014 betweenbrain llc. All Rights Reserved.
 * License    GNU GPL v2 or later
 */

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
				</li>
			<?php endforeach ?>
		</ul>
		<input type="radio" name="location" value="birth">Born<br>
		<input type="radio" name="location" value="primary" checked>Primary
	</form>
</section>

<div id="map-canvas"></div>
