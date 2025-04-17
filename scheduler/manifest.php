<?php
$manifest = array (
  'built_in_version' => '13.*.*',
  'acceptable_sugar_versions' => 
  array (
    0 => '13.*.*',
    1 => '14.*.*',
  ),
  'acceptable_sugar_flavors' => 
  array (
    0 => 'ENT',
    1 => 'ULT',
  ),
  'readme' => '',
  'key' => '',
  'author' => 'Ambit Software',
  'description' => 'Scheduler - custom Emails Send For Survey',
  'icon' => '',
  'is_uninstallable' => true,
  'name' => 'Habasit_Scheduler_customEmailsSendForSurvey_1.0',
  'published_date' => '2025-04-08 18:10:00', 
  'type' => 'module',
  'version' => 1.0,
  'remove_tables' => 'prompt',
);
$installdefs = array (
  'id' => 'Habasit_Scheduler_customEmailsSendForSurvey_1.0',
  'relationships' => 
  array (
  ),
  'copy' => 
  array (
    0 => 
    array (
      'from' => '<basepath>/Files/custom/Extension/modules/Schedulers/Ext/Language/en_us.customEmailsSendForSurvey.php',
      'to' => 'custom/Extension/modules/Schedulers/Ext/Language/en_us.customEmailsSendForSurvey.php',
    ),
	 1 => 
    array (
      'from' => '<basepath>/Files/custom/Extension/modules/Schedulers/Ext/ScheduledTasks/customEmailsSendForSurvey.php',
      'to' => 'custom/Extension/modules/Schedulers/Ext/ScheduledTasks/customEmailsSendForSurvey.php',
    ),
	
  )
);

?>