<?php

$manifest = array (
  'built_in_version' => '14.1.0',
  'acceptable_sugar_versions' => 
  array (
	0 => '14.*.*'
  ),
  'acceptable_sugar_flavors' => 
  array (
    0 => 'ENT',
    1 => 'ULT',
  ),
  'readme' => '',
  'key' => '',
  'author' => 'Ambit Software',
  'description' => 'Custom schedular to create records in Survey, Survey Failure module based on conditions. Emails survey data to linked account module assigned user.',
  'icon' => '',
  'is_uninstallable' => true,
  'name' => 'Habasit_Survey_Validation_0.2',
  'published_date' => '2025-04-15',
  'type' => 'module',
  'version' => 0.2,
);

$installdefs = array (
	'id' => 'Habasit_Survey_Validation_0.2',
	'copy' => array (
		1 => array (
			'from' => '<basepath>/Files/custom/Extension/modules/Schedulers/Ext/ScheduledTasks/CustomCreateSurveys.php',
			'to' => 'custom/Extension/modules/Schedulers/Ext/ScheduledTasks/CustomCreateSurveys.php',
		),
		2 => array (
			'from' => '<basepath>/Files/custom/Extension/modules/Schedulers/Ext/Language/en_us.CustomCreateSurveys.php',
			'to' => 'custom/Extension/modules/Schedulers/Ext/Language/en_us.CustomCreateSurveys.php',
		),
		3 => array (
			'from' => '<basepath>/Files/custom/Extension/modules/Schedulers/Ext/Language/en_us.customEmailsSendForSurvey.php',
			'to' => 'custom/Extension/modules/Schedulers/Ext/Language/en_us.customEmailsSendForSurvey.php',
		),
		4 => array (
			'from' => '<basepath>/Files/custom/Extension/modules/Schedulers/Ext/ScheduledTasks/customEmailsSendForSurvey.php',
			'to' => 'custom/Extension/modules/Schedulers/Ext/ScheduledTasks/customEmailsSendForSurvey.php',
		),
	)
);

?>



