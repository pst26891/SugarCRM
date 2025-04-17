<?php

if (!defined('sugarEntry') || !sugarEntry) die('Not A Valid Entry Point');

class update_related_account
{
	function before_delete_update($bean, $event, $arguments)
	{
		//update NPS score as 0
		if(isset($bean->su_survey_accountsaccounts_ida)) {
			$latestSurveyID= $this->getLatestSurvey($bean->su_survey_accountsaccounts_ida);
			if(!empty($latestSurveyID) && ($bean->id==$latestSurveyID)) {
				$this->updateNPSscore(0,$bean->su_survey_accountsaccounts_ida);
			}
		}
	}
	/**
	 * Function to get latest survey record related to same account
	 */
	function getLatestSurvey($accountID)
	{
		$latestSurvey ='';
		if(!empty($accountID)) {
			$SugarQuery = new SugarQuery();
			$SugarQuery->from(BeanFactory::newBean('SU_Survey'),array('alias' => 's'),array('team_security' => false));
			$SugarQuery->joinTable('su_survey_accounts_c', array('alias' => 'sa', 'linkingTable' => true))->on()->equalsField("sa.su_survey_accountssu_survey_idb", 's.id')->equals('sa.deleted', 0);
			$SugarQuery->select(array('s.id'));
			$SugarQuery->where()->equals('sa.su_survey_accountsaccounts_ida',$accountID);
			$SugarQuery->orderBy("s.date_entered");
			$latestSurvey = $SugarQuery->getOne();
		}
		return $latestSurvey;
	}
	
	/**
	 * Function to update NPS Score as zero in survey related account if latest survey record is getting deleted
	 */
	function updateNPSscore($NpsScore,$accountID)
	{
		$update_acc="UPDATE accounts_cstm SET nps_score_c='".$NpsScore."' WHERE id_c='".$accountID."'";
		$GLOBALS['db']->query($update_acc);
		return true;
	}
}

?>