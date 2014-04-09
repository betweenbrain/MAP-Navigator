<?php defined('_JEXEC') or die;

/**
 * File       map_navigator.php
 * Created    4/9/14 11:08 AM
 * Author     Matt Thomas | matt@betweenbrain.com | http://betweenbrain.com
 * Support    https://github.com/betweenbrain/
 * Copyright  Copyright (C) 2014 betweenbrain llc. All Rights Reserved.
 * License    GNU GPL v2 or later
 */

require_once(JPATH_COMPONENT . '/controller.php');

// Require specific controller if requested
if ($controller = JRequest::getWord('controller'))
{
	$path = JPATH_COMPONENT . '/controllers/' . $controller . '.php';
	if (file_exists($path))
	{
		require_once $path;
	}
	else
	{
		$controller = '';
	}
}

// Create the controller
$classname  = 'MapnavigatorController' . $controller;
$controller = new $classname();

// Perform the Request task
$controller->execute(JRequest::getWord('task'));

// Redirect if set by the controller
$controller->redirect();