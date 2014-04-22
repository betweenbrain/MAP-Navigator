<?php defined('_JEXEC') or die;

/**
 * File       default.php
 * Created    4/9/14 11:09 AM
 * Author     Matt Thomas | matt@betweenbrain.com | http://betweenbrain.com
 * Support    https://github.com/betweenbrain/
 * Copyright  Copyright (C) 2014 betweenbrain llc. All Rights Reserved.
 * License    GNU GPL v2 or later
 */
// TODO: http://docs.joomla.org/API15:JFilterOutput/stringURLSafe breaks for some odd reason
function stringURLSafe($string)
{
	//remove any '-' from the string they will be used as concatonater
	$str = str_replace('-', ' ', $string);

	$lang =& JFactory::getLanguage();
	$str  = $lang->transliterate($str);

	// remove any duplicate whitespace, and ensure all characters are alphanumeric
	$str = preg_replace(array('/\s+/', '/[^A-Za-z0-9\-]/'), array('-', ''), $str);

	// lowercase and trim
	$str = trim(strtolower($str));

	return $str;
}

$params = & JComponentHelper::getParams('com_mapnavigator');
?>
<section class="map-navigator">
	<ul id="sidebar"></ul>
	<form id="filters">
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
	<form id="toolbar">
		<label class="global">
			<input type="radio" name="region" value="">Global
		</label>
		<?php foreach ($this->regions as $region) : ?>
			<label class="<?php echo stringURLSafe($region->name) ?>">
				<input type="radio" name="region" value="<?php echo $region->id ?>"><?php echo $region->name ?>
			</label>
		<?php endforeach ?>
	</form>
</section>
<div id="map-canvas"></div>
