<?php defined('_JEXEC') or die;

/**
 * File       multiplek2categories.php
 * Created    4/17/14 3:01 PM
 * Author     Matt Thomas | matt@betweenbrain.com | http://betweenbrain.com
 * Support    https://github.com/betweenbrain/
 * Copyright  Copyright (C) 2014 betweenbrain llc. All Rights Reserved.
 * License    GNU GPL v2 or later
 *
 * based on code from below
 */

/**
 * @version        2.6.x
 * @package        K2
 * @author         JoomlaWorks http://www.joomlaworks.net
 * @copyright      Copyright (c) 2006 - 2014 JoomlaWorks Ltd. All rights reserved.
 * @license        GNU/GPL license: http://www.gnu.org/copyleft/gpl.html
 */
class JElementMultipleK2categories extends JElement
{

	function fetchElement($name, $itemalue, &$node, $control_name)
	{
		$db    = JFactory::getDBO();
		$query = 'SELECT m.* FROM #__k2_categories m WHERE trash = 0 ORDER BY parent, ordering';
		$db->setQuery($query);
		$items    = $db->loadObjectList();
		$children = array();

		if ($items)
		{
			foreach ($items as $item)
			{
				$parent = $item->parent;
				$list   = @$children[$parent] ? $children[$parent] : array();
				array_push($list, $item);
				$children[$parent] = $list;
			}
		}

		$list  = JHTML::_('menu.treerecurse', 0, '', array(), $children, 9999, 0, 0);
		$items = array();

		foreach ($list as $item)
		{
			$item->treename = JString::str_ireplace('&#160;', '- ', $item->treename);
			$items[]        = JHTML::_('select.option', $item->id, '   ' . $item->treename);
		}

		return JHTML::_('select.genericlist', $items, $control_name . '[' . $name . '][]', 'class="inputbox" multiple="multiple" size="10"', 'value', 'text', $itemalue);
	}
}
