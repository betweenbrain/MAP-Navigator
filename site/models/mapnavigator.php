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
	 * @internal param $subject
	 * @internal param $params
	 */
	function __construct()
	{
		parent::__construct();
		$this->db = JFactory::getDbo();
	}

	/**
	 * Get the K2 item and locations data that correspond to items in the additional categories as designated by the categories URL parameter
	 *
	 * @return string The greeting to be displayed to the user
	 */
	function getItems()
	{
		$query = ' SELECT ' .
			$this->db->nameQuote('k2.title') . ',' .
			$this->db->nameQuote('k2.introtext') . ',' .
			$this->db->nameQuote('loc.locations') .
			' FROM ' . $this->db->nameQuote('#__k2_items') . ' AS ' . $this->db->nameQuote('k2') .
			' JOIN ' . $this->db->nameQuote('#__k2_items_locations') . ' AS ' . $this->db->nameQuote('loc') .
			' ON (' . $this->db->nameQuote('loc.itemId') . ' = ' . $this->db->nameQuote('k2.id') . ')' .
			' JOIN ' . $this->db->nameQuote('#__k2_additional_categories') . ' AS ' . $this->db->nameQuote('cats') .
			' ON (' . $this->db->nameQuote('k2.id') . ' = ' . $this->db->nameQuote('cats.itemId') . ')' .
			' WHERE ' . $this->db->nameQuote('cats.catid') . ' IN (' . implode(',', json_decode(JRequest::getVar('categories'))) . ')' .
			' AND ' . $this->db->nameQuote('k2.trash') . ' = ' . $this->db->quote('0');

		$this->db->setQuery($query);

		return $this->db->loadObjectList();
	}

	/**
	 * Generates marker data from items retrieved
	 *
	 * @param   $items
	 */
	function generateMarkerData($items)
	{

		foreach ($items as $item)
		{
			foreach (json_decode($item->locations, true) as $name => $data)
			{
				$markers[] = array('loc' => $name, 'lat' => $data['lat'], 'lng' => $data['lng'], 'info' => $item->introtext, 'title' => $item->title);
			}
		}

		return $markers;
	}
}
