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
 * @package    Mapnavigator
 */
class MapnavigatorViewMapnavigator extends JView
{

	/**
	 * Construct
	 */
	function __construct()
	{
		parent::__construct();
		$this->doc = JFactory::getDocument();
	}

	/**
	 * Display stuff
	 *
	 * @param   null $tpl
	 *
	 * @return  null
	 *
	 * @since 0.1
	 */
	function display($tpl = null)
	{
		$app   = JFactory::getApplication();
		$model = & $this->getModel();
		$items = $model->getItems();

		// Set the MIME type for JSON output.
		$this->doc->setMimeEncoding('application/json');

		echo json_encode($model->generateMarkerData($items));
		$app->close();

	}
}
