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
		$this->db     = JFactory::getDbo();
		$this->params = JComponentHelper::getParams('com_mapnavigator');
	}

	/**
	 * Get the K2 item and locations data that correspond to items in the additional categories as designated by the categories URL parameter
	 *
	 * @return string The greeting to be displayed to the user
	 */
	function getItems()
	{
		$query = ' SELECT ' .
			$this->db->nameQuote('k2.alias') . ',' .
			$this->db->nameQuote('k2.title') . ',' .
			$this->db->nameQuote('k2.introtext') . ',' .
			$this->db->nameQuote('k2.plugins') . ',' .
			$this->db->nameQuote('loc.locations') . ',' .

			// Get all additional categories
			' ( SELECT ' .
			' GROUP_CONCAT(' . $this->db->nameQuote('cats.catid') . ')' .
			' FROM ' . $this->db->nameQuote('#__k2_additional_categories') . ' AS ' . $this->db->nameQuote('cats') .
			' WHERE ' . $this->db->nameQuote('k2.id') . ' = ' . $this->db->nameQuote('cats.itemId') .
			') AS ' . $this->db->nameQuote('categoryIDs') . ',' .

			// Get first additional categories name
			' ( SELECT ' .
			$this->db->nameQuote('cat.alias') .
			' FROM ' . $this->db->nameQuote('#__k2_categories') . ' AS ' . $this->db->nameQuote('cat') .
			' JOIN ' . $this->db->nameQuote('#__k2_additional_categories') . ' AS ' . $this->db->nameQuote('cats') .
			' ON (' . $this->db->nameQuote('cat.id') . ' = ' . $this->db->nameQuote('cats.catid') . ')' .
			' WHERE ' . $this->db->nameQuote('k2.id') . ' = ' . $this->db->nameQuote('cats.itemId') .
			' AND ' . $this->db->nameQuote('cat.id') . ' NOT IN (' . implode(',', $this->params->get('regionCategories')) . ')' .
			' AND ' . $this->db->nameQuote('parent') . ' = ' . $this->db->quote($this->params->get('primaryCategory')) .
			' LIMIT 1 ' .
			') AS ' . $this->db->nameQuote('category') .

			// Join K2 items, K2 locations and additional categories tables by item ID
			' FROM ' . $this->db->nameQuote('#__k2_items') . ' AS ' . $this->db->nameQuote('k2') .
			' JOIN ' . $this->db->nameQuote('#__k2_items_locations') . ' AS ' . $this->db->nameQuote('loc') .
			' ON (' . $this->db->nameQuote('loc.itemId') . ' = ' . $this->db->nameQuote('k2.id') . ')' .
			' JOIN ' . $this->db->nameQuote('#__k2_additional_categories') . ' AS ' . $this->db->nameQuote('cats') .
			' ON (' . $this->db->nameQuote('k2.id') . ' = ' . $this->db->nameQuote('cats.itemId') . ')' .

			// Limit results to items that only have the correct additional categories
			' WHERE ' . $this->db->nameQuote('cats.catid') . ' IN (' . implode(',', JRequest::getVar('categories')) . ')' .

			// Published items only
			' AND ' . $this->db->nameQuote('published') . ' = ' . $this->db->quote('1') .
			' AND ' . $this->db->nameQuote('k2.trash') . ' = ' . $this->db->quote('0');

		$this->db->setQuery($query);

		return $this->setUniversalFields($this->db->loadObjectList());
	}

	/**
	 * Get all sub-categories of primary category
	 *
	 * @param $primaryCategory
	 *
	 * @return mixed
	 */
	function getCategories()
	{
		$query = ' SELECT ' .
			$this->db->nameQuote('alias') . ',' .
			$this->db->nameQuote('id') . ',' .
			$this->db->nameQuote('name') .
			' FROM ' . $this->db->nameQuote('#__k2_categories') .
			' WHERE ' . $this->db->nameQuote('parent') . ' = ' . $this->db->quote($this->params->get('primaryCategory')) .
			' AND ' . $this->db->nameQuote('id') . ' NOT IN (' . implode(',', $this->params->get('regionCategories')) . ')' .
			' AND ' . $this->db->nameQuote('published') . ' = ' . $this->db->quote('1') .
			' AND ' . $this->db->nameQuote('trash') . ' = ' . $this->db->quote('0') .
			' ORDER BY ' . $this->db->nameQuote('ordering') . ' ASC';

		$this->db->setQuery($query);

		return $this->db->loadObjectList();
	}

	/**
	 * @param $regionCategories
	 *
	 * @return mixed
	 */
	function getRegionCategories()
	{
		$query = ' SELECT ' .
			$this->db->nameQuote('id') . ',' .
			$this->db->nameQuote('name') . ',' .
			$this->db->nameQuote('alias') .
			' FROM ' . $this->db->nameQuote('#__k2_categories') .
			' WHERE ' . $this->db->nameQuote('id') . ' IN (' . implode(',', $this->params->get('regionCategories')) . ')' .
			' AND ' . $this->db->nameQuote('published') . ' = ' . $this->db->quote('1');

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
		$key = null;

		foreach ($items as $item)
		{
			// Filter by region
			if (JRequest::getVar('region') != '' && !in_array(JRequest::getVar('region'), explode(',', $item->categoryIDs)))
			{
				continue;
			}

			foreach (json_decode($item->locations, true) as $type => $locales)
			{
				// Filter locations by type if belonging to the designated category
				if (($item->catid === $this->params->get('artistCategory')) && ($type != JRequest::getVar('location')))
				{
					continue;
				}

				foreach ($locales as $name => $data)
				{
					$markers[$key]['alias']    = $item->alias;
					$markers[$key]['info']     = $item->introtext;
					$markers[$key]['lat']      = $data['lat'];
					$markers[$key]['lng']      = $data['lng'];
					$markers[$key]['loc']      = $name;
					$markers[$key]['title']    = $item->title;
					$markers[$key]['type']     = $type;
					$markers[$key]['category'] = $item->category;

					if (array_key_exists('itemImage', $item->universalFields))
					{
						$markers[$key]['image'] = $item->universalFields->itemImage;
					}

					$key++;
				}
			}
		}

		return $markers;
	}

	/**
	 * Inspects the plugins data of the item, in search for universal fields, and attaches them to the item object if found
	 *
	 * @param $items
	 *
	 * @return mixed
	 */
	function setUniversalFields($items)
	{
		foreach ($items as $item)
		{
			$item->universalFields = new stdClass;

			array_walk(parse_ini_string($item->plugins), function (&$v, $k) use ($item)
			{
				if (preg_match('/universal_fields/', $k))
				{
					$k                         = str_replace('universal_fields', '', $k);
					$item->universalFields->$k = $v;
				}
			});
		}

		return $items;

	}
}
