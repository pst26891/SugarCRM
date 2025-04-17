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
  'description' => 'date format issue, ignore custom source field in documents,update NPS score as 0',
  'icon' => '',
  'is_uninstallable' => true,
  'name' => 'Habasit_Survey_Validation_0.5',
  'published_date' => '2025-04-16',
  'type' => 'module',
  'version' => 0.5,
);

$installdefs = array (
	'id' => 'Habasit_Survey_Validation_0.5',
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
		5 => array (
			'from' => '<basepath>/Files/custom/modules/SU_Survey/update_related_account.php',
			'to' => 'custom/modules/SU_Survey/update_related_account.php',
		),
		6 => array (
			'from' => '<basepath>/Files/custom/Extension/modules/SU_Survey/Ext/LogicHooks/before_delete_hook.php',
			'to' => 'custom/Extension/modules/SU_Survey/Ext/LogicHooks/before_delete_hook.php',
		),
	)
);

?>



