<?php defined('_JEXEC') or die;

/**
 * File       mapnavigator.php
 * Created    4/9/14 11:33 AM
 * Author     Matt Thomas | matt@betweenbrain.com | http://betweenbrain.com
 * Support    https://github.com/betweenbrain/
 * Copyright  Copyright (C) 2014 betweenbrain llc. All Rights Reserved.
 * License    GNU GPL v2 or later
 */

jimport('joomla.application.component.model');

/**
 * MAP Navigator Model
 *
 * @package     Joomla.Tutorials
 * @subpackage  Components
 * @since       0.1
 */
class MapnavigatorModelMapnavigator extends JModel
{

	/**
	 * Construct
	 *
	 * @param   $subject
	 * @param   $params
	 */
	function __construct(&$subject, $params)
	{
		parent::__construct($subject, $params);
		$this->app = JFactory::getApplication();
		$this->db  = JFactory::getDbo();
		$this->doc = JFactory::getDocument();
	}

	/**
	 * Gets the greeting
	 *
	 * @return string The greeting to be displayed to the user
	 */
	function getItems()
	{
		$query = ' SELECT locations' .
			' FROM #__k2_items_locations';

		$this->db->setQuery($query);

		return $this->db->loadObjectList();
	}
}
