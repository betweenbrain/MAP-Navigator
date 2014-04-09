<?php defined('_JEXEC') or die;

/**
 * File       view.html.php
 * Created    4/9/14 11:09 AM
 * Author     Matt Thomas | matt@betweenbrain.com | http://betweenbrain.com
 * Support    https://github.com/betweenbrain/
 * Copyright  Copyright (C) 2014 betweenbrain llc. All Rights Reserved.
 * License    GNU GPL v2 or later
 */

jimport('joomla.application.component.view');

/**
 * HTML View class for the MAP Navigator Component
 *
 * @package    HelloWorld
 */
class MapnavigatorViewMapnavigator extends JView
{
	function display($tpl = null)
	{
		$model = & $this->getModel();
		$items = $model->getItems();
		$this->assignRef('items', $items);

		parent::display($tpl);
	}
}
