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
			$this->db->nameQuote('k2.plugins') . ',' .
			$this->db->nameQuote('cats.catid') . ',' .
			$this->db->nameQuote('loc.locations') . ',' .
			' ( SELECT ' .
			' GROUP_CONCAT(' . $this->db->nameQuote('cats.catid') . ')' .
			' FROM ' . $this->db->nameQuote('#__k2_additional_categories') . ' AS ' . $this->db->nameQuote('cats') .
			' WHERE ' . $this->db->nameQuote('k2.id') . ' = ' . $this->db->nameQuote('cats.itemId') .
			') AS ' . $this->db->nameQuote('categories') .
			' FROM ' . $this->db->nameQuote('#__k2_items') . ' AS ' . $this->db->nameQuote('k2') .
			' JOIN ' . $this->db->nameQuote('#__k2_items_locations') . ' AS ' . $this->db->nameQuote('loc') .
			' ON (' . $this->db->nameQuote('loc.itemId') . ' = ' . $this->db->nameQuote('k2.id') . ')' .
			' JOIN ' . $this->db->nameQuote('#__k2_additional_categories') . ' AS ' . $this->db->nameQuote('cats') .
			' ON (' . $this->db->nameQuote('k2.id') . ' = ' . $this->db->nameQuote('cats.itemId') . ')' .
			' WHERE ' . $this->db->nameQuote('cats.catid') . ' IN (' . implode(',', JRequest::getVar('categories')) . ')' .
			' AND ' . $this->db->nameQuote('k2.trash') . ' = ' . $this->db->quote('0');

		$this->db->setQuery($query);

		return $this->setUniversalFields($this->db->loadObjectList());
	}

	/**
	 * Returns a list of the child categories of the primary category
	 *
	 * @param $primaryCategory
	 *
	 * @return mixed
	 */
	function getCategories($primaryCategory)
	{
		$query = ' SELECT ' .
			$this->db->nameQuote('id') . ',' .
			$this->db->nameQuote('name') .
			' FROM ' . $this->db->nameQuote('#__k2_categories') .
			' WHERE ' . $this->db->nameQuote('parent') . ' = ' . $this->db->quote($primaryCategory) .
			' AND ' . $this->db->nameQuote('published') . ' = ' . $this->db->quote('1');

		$this->db->setQuery($query);

		return $this->db->loadObjectList();
	}

	/**
	 * Retrieves the Region Categories used for filtering
	 *
	 * @param $regionCategories
	 *
	 * @return mixed
	 */
	function getRegionCategories($regionCategories)
	{
		$query = ' SELECT ' .
			$this->db->nameQuote('id') . ',' .
			$this->db->nameQuote('name') .
			' FROM ' . $this->db->nameQuote('#__k2_categories') .
			' WHERE ' . $this->db->nameQuote('id') . ' IN (' . implode(',', $regionCategories) . ')' .
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
		$key    = null;
		$params = & JComponentHelper::getParams('com_mapnavigator');

		foreach ($items as $item)
		{
			if ($item->catid === $params->get('artistCategory'))
			{
				foreach (json_decode($item->locations, true) as $type => $locales)
				{
					if ($type === JRequest::getVar('location'))
					{
						foreach ($locales as $name => $data)
						{
							$markers[$key]['loc']   = $name;
							$markers[$key]['type']  = $type;
							$markers[$key]['lat']   = $data['lat'];
							$markers[$key]['lng']   = $data['lng'];
							$markers[$key]['info']  = $item->introtext;
							$markers[$key]['title'] = $item->title;
							$markers[$key]['test']  = JRequest::getVar('location');

							if (array_key_exists('itemImage', $item->universalFields))
							{
								$markers[$key]['image'] = $item->universalFields->itemImage;
							}

							$key++;
						}
					}
				}
			}
			else
			{
				foreach (json_decode($item->locations, true) as $type => $locales)
				{
					foreach ($locales as $name => $data)
					{
						$markers[$key]['loc']   = $name;
						$markers[$key]['type']  = $type;
						$markers[$key]['lat']   = $data['lat'];
						$markers[$key]['lng']   = $data['lng'];
						$markers[$key]['info']  = $item->introtext;
						$markers[$key]['title'] = $item->title;
						$markers[$key]['test']  = JRequest::getVar('location');

						if (array_key_exists('itemImage', $item->universalFields))
						{
							$markers[$key]['image'] = $item->universalFields->itemImage;
						}

						$key++;
					}
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
