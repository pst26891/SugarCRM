<?php

use ParseCsv\Csv;
// Add job string for execution
$job_strings[] = "CustomCreateSurveys";

/**
 * Custom function to fetch survey data for CSV file uploaded in Documents and create records in Survey module with linkage to accounts.
 */
function CustomCreateSurveys()
{
	try {
		$validDocuments = getValidDocuments();
		if(!empty($validDocuments)){
			foreach($validDocuments as $d_revision){
				if(isset($d_revision['revision_id']) && isset($d_revision['filename'])){
					createSurveyRecords($d_revision['revision_id'],$d_revision['filename']);
				}
			}
		}else{
			$GLOBALS["log"]->fatal("No records found to create Surveys: ".date('Y-m-d H:i:s'));
		}
    }catch (Exception $e) {
		$GLOBALS["log"]->fatal("Error in creating Survey records: " . $e->getMessage());
		markSurveyFailure("Error in creating Survey records",$e->getMessage());
    }
	return true; 
}

/**
 * Function to get valid documents
 */
function createSurveyRecords($document_id,$csv_filename){
	try {
        //SugarQuery to fetch survey data
		$document_data = [];
		$splited_doc_id = explode("-", $document_id)[0];
		$three_digitof_doc_id = substr($splited_doc_id, -3);
		$csv = new Csv();
		$csv->use_mb_convert_encoding = true;
		$document_data = $csv->parseFile("upload/$three_digitof_doc_id/$document_id");
		
		if(!empty($document_data)){
			$dwh_key = $survey_name_key = $nps_score_key = $start_date_key = $end_date_key =$respondentID_key = $collectorID_key = $email_key = '';
			//header mapping for fields
			$headerMap = [ 'field 1' => 'field_1', 'field 2' => 'field_2', 'field 3' => 'field_3', 'field 4' => 'field_4', 'field 5' => 'field_5', 'field 6' => 'field_6', 'field 7' => 'field_7', 'field 8' => 'field_8', 'field 9' => 'field_9', 'field 10' => 'field_10', 'field 11' => 'field_11', 'field 12' => 'field_12', 'field 13' => 'field_13', 'field 14' => 'field_14', 'field 15' => 'field_15', 'field 16' => 'field_16', 'field 17' => 'field_17', 'field 18' => 'field_18', 'field 19' => 'field_19', 'field 20' => 'field_20', 'question 1' => 'question_1', 'question 2' => 'question_2', 'question 3' => 'question_3', 'question 4' => 'question_4', 'question 5' => 'question_5', 'question 6' => 'question_6', 'question 7' => 'question_7', 'question 8' => 'question_8', 'question 9' => 'question_9', 'question 10' => 'question_10', 'question 11' => 'question_11_c', 'question 12' => 'question_12_c', 'question 13' => 'question_13_c', 'question 14' => 'question_14_c', 'question 15' => 'question_15_c', 'question 16' => 'question_16_c', 'question 17' => 'question_17_c', 'question 18' => 'question_18_c', 'question 19' => 'question_19_c', 'question 20' => 'question_20_c' ];
			//header mapping for field values
			$headerMap1 = [ 'field 1' => 'value_1', 'field 2' => 'value_2', 'field 3' => 'value_3', 'field 4' => 'value_4', 'field 5' => 'value_5', 'field 6' => 'value_6', 'field 7' => 'value_7', 'field 8' => 'value_8', 'field 9' => 'value_9', 'field 10' => 'value_10', 'field 11' => 'value_11', 'field 12' => 'value_12', 'field 13' => 'value_13', 'field 14' => 'value_14', 'field 15' => 'value_15', 'field 16' => 'value_16', 'field 17' => 'value_17', 'field 18' => 'value_18', 'field 19' => 'value_19', 'field 20' => 'value_20', 'question 1' => 'answer_1_c', 'question 2' => 'answer_2_c', 'question 3' => 'answer_3_c', 'question 4' => 'answer_4_c', 'question 5' => 'answer_5_c', 'question 6' => 'answer_6_c', 'question 7' => 'answer_7_c', 'question 8' => 'answer_8_c', 'question 9' => 'answer_9_c', 'question 10' => 'answer_10_c', 'question 11' => 'answer_11_c', 'question 12' => 'answer_12_c', 'question 13' => 'answer_13_c', 'question 14' => 'answer_14_c', 'question 15' => 'answer_15_c', 'question 16' => 'answer_16_c', 'question 17' => 'answer_17_c', 'question 18' => 'answer_18_c', 'question 19' => 'answer_19_c', 'question 20' => 'answer_20_c' ];
			
			$survey_field_data = [];
			if(isset($document_data[0])){
				foreach ($document_data[0] as $header_val) {
					if (strcasecmp($header_val, 'respondent id') === 0)
						$respondent_found = true;
					if(strcasecmp($header_val, 'dwhs key') === 0)
						$dwhs_found = true;
					if(strcasecmp($header_val, 'email address') === 0)
						$email_found = true;
				}
				if ($respondent_found && $dwhs_found && $email_found){
					foreach($document_data[0] as $key1 => $val){
						if(trim(strtolower($val))=='respondent id'){
							$respondentID_key=$key1;
						}else if(trim(strtolower($val))=='collector id'){
							$collectorID_key=$key1;
						}else if(trim(strtolower($val))=='dwhs key'){
							$dwh_key=$key1;
						}else if(trim(strtolower($val))=='survey name'){
							$survey_name_key=$key1;
						}else if(trim(strtolower($val))=='nps score'){
							$nps_score_key=$key1;
						}else if(trim(strtolower($val))=='start date'){
							$start_date_key=$key1;
						}else if(trim(strtolower($val))=='end date'){
							$end_date_key=$key1;
						}else if(trim(strtolower($val))=='email address'){
							$email_key=$key1;
						}
						$fieldName = isset($headerMap[trim(strtolower($key1))]) ? $headerMap[trim(strtolower($key1))] : null;
						if(!empty($fieldName)){
							$survey_field_data[$fieldName] = $val;
						}
					}
					$headerMap1[$respondentID_key]='respondent_id_c';
					$headerMap1[$collectorID_key]='collector_id_c';
					$headerMap1[$dwh_key]='dwhs_key';
					$headerMap1[$survey_name_key]='name';
					$headerMap1[$nps_score_key]='nps_score';
					$headerMap1[$start_date_key]='survey_run_date';
					$headerMap1[$end_date_key]='customer_feedback_date';
					$headerMap1[$email_key]='email_address_c';
				}else{
					throw new Exception('Missing Required Headers');
				}
			}else{
				throw new Exception('Missing Required Headers');
			}
			//unset header data array index
			unset($document_data[0]);
			foreach($document_data as $key => $survey_data){
				foreach($survey_data as $index=> $header_data){
					$fieldName = isset($headerMap1[trim(strtolower($index))]) ? $headerMap1[trim(strtolower($index))] : null;
					if(!empty($fieldName)){
						$survey_header_1[$fieldName] = $header_data;
					}
				}
				// merge field and field values in final array to create records in survey module
				$final_survey_records[] = array_merge($survey_header_1,$survey_field_data);
			}
			
			//create records in survey module
			if(isset($final_survey_records)){
				foreach($final_survey_records as $survey){
					$flag = $duplication_check = true; $NpsScore = $accountID = '';
					$surveyBean = BeanFactory::newBean('SU_Survey');
					
					try {
						foreach($survey as $field => $value){
							if(isset($survey['respondent_id_c']) && isset($survey['dwhs_key']) && isset($survey['email_address_c'])){
								if(!empty($survey['respondent_id_c']) && !empty($survey['dwhs_key']) && !empty($survey['email_address_c'])){
									if($duplication_check){
										$duplication_check=false;
										$respondent_id_c = $survey['respondent_id_c'];
										$dwhs_key = $survey['dwhs_key'];
										$email_address_c = $survey['email_address_c'];
										$SurveyID = checkDuplication($respondent_id_c,$dwhs_key,$email_address_c);
										if(!empty($SurveyID)){
											$flag= false;
											//SU_Survey_Failure
											throw new Exception("Duplication Found - Survey ID - $SurveyID : Respondent ID - $respondent_id_c, DWHs Key - $dwhs_key ,Email Address - $email_address_c");
										}
									}
									if($field=='dwhs_key'){
										$dwhs_key = isset($survey['respondent_id_c']) ? $survey['respondent_id_c'] : null;
										
										$acc_id_sql = "SELECT id FROM accounts a INNER JOIN accounts_cstm acc ON (a.id=acc.id_c) WHERE acc.dwh_skey_c='".$value."' AND a.deleted=0";
										$accountID = $GLOBALS['db']->getOne($acc_id_sql);
										if(empty($accountID)){
											$flag= false;
											throw new Exception("Account Not Found DWHs Key : $value ");
										}
									}else if($field == "survey_run_date" || $field == "customer_feedback_date"){
										$date = parseDates($value);
										if ($date) {
											$value = $date->format('Y-m-d');// Desired format
										} else {
											throw new Exception("Date Format is not supported : $value - Respondent ID -".$survey['respondent_id_c']."DWHs Key -".$survey['dwhs_key']."Email Address - ".$survey['email_address_c']);
										}
									}else if($field == "nps_score"){
										$NpsScore = $value;
									}
									$surveyBean->$field =  mb_convert_encoding($value, 'UTF-8', 'UTF-8');
								}else{
									$flag= false;
									throw new Exception('Missing Required Fields');
								}
							}else{
								$flag = false;
								throw new Exception('Missing Required Fields');
							}
						}
						if($flag && !empty($accountID)){
							$AccDetails = getAccountDetails($accountID);
							$assignedUserId = isset($AccDetails[0]['assigned_user_id']) ? $AccDetails[0]['assigned_user_id'] : "";
							$accTeamID = isset($AccDetails[0]['team_id']) ? $AccDetails[0]['team_id'] : "";
							$accTeamSetId = isset($AccDetails[0]['team_set_id']) ? $AccDetails[0]['team_set_id'] : "";
							
							$surveyBean->assigned_user_id = $assignedUserId;
							$surveyBean->team_id = $accTeamID;
							$surveyBean->team_set_id = $accTeamSetId;
							$surveyBean->su_survey_accountsaccounts_ida = $accountID;
							$surveyBean->save();
							if(!empty($NpsScore))
								updateNPSscore($NpsScore,$accountID);
						}else{
							throw new Exception('Unable to create Survey');
						}
					} catch (Exception $e) {
						$msg = $e->getMessage();
						$surveyFailureBean = BeanFactory::newBean('SU_Survey_Failure');
						$surveyFailureBean->name = $csv_filename;
						$surveyFailureBean->timestamp_failure = date('Y-m-d H:i:s');
						$surveyFailureBean->description = "$msg - ".json_encode($survey);
						$surveyFailureBean->save();
						continue;
					}
				}
			}
		}else{
			$desc = "No Data Found  - ".json_encode($document_data);
			markSurveyFailure($csv_filename,$desc);
		}
       
    } catch (Exception $e) {
		markSurveyFailure($csv_filename,$e->getMessage());
    }
	return true;
}

/**
 * Function to get valid documents
 */
function getValidDocuments(){
	$doc_arr = array();
	$get_doc = new SugarQuery();
	$get_doc->from(BeanFactory::newBean('Documents'), array('alias' => 'd'),array('team_security' => false));
	$get_doc->joinTable('document_revisions', array('alias' => 'dr', 'linkingTable' => true))->on()->equalsField("dr.document_id", 'd.id');
	$get_doc->select(array('d.id AS document_id','dr.id AS revision_id','dr.filename'));
	$get_doc->where()->addRaw("dr.deleted=0  AND survey_processing_c='1' AND dr.file_ext='csv' AND DATE(d.date_entered)= current_date()");
	$get_doc->orderBy('dr.date_entered');
	$get_doc->limit(5);
	$doc_arr = $get_doc->execute();
	return $doc_arr;
}

/**
 * Function to mark Survey Failure
 */
function markSurveyFailure($name='No Name',$desc)
{
    $surveyFailureBean = BeanFactory::newBean('SU_Survey_Failure');
	$surveyFailureBean->name = $name;
	$surveyFailureBean->timestamp_failure = date('Y-m-d H:i:s');
	$surveyFailureBean->description = $desc;
	$surveyFailureBean->assigned_user_id = '1';
	$surveyFailureBean->save();
    return true;
}

/**
 * Function to update NPS Score in survey related account
 */
function updateNPSscore($NpsScore,$accountID){
	$update_acc="UPDATE accounts_cstm SET nps_score_c='".$NpsScore."' WHERE id_c='".$accountID."'";
	$GLOBALS['db']->query($update_acc);
	return true;
}

/**
 * Function to get account using DWHs Key
 */
function getAccountDetails($accountID){
	$SugarQuery = new SugarQuery();
	$SugarQuery->from(BeanFactory::newBean('Accounts'),array('team_security' => false));
	$SugarQuery->select(array('assigned_user_id','team_id','team_set_id'));
	$SugarQuery->where()->equals('id',$accountID);
	$AccDetails = $SugarQuery->execute();
	return $AccDetails;
}

/**
 * Function to check duplication in Survey based on Respondent ID, DWHs Key, Email Address
 */
function checkDuplication($respondent_id_c,$dwhs_key,$email_address_c){
	$SugarQuery = new SugarQuery();
	$SugarQuery->from(BeanFactory::newBean('SU_Survey'),array('team_security' => false));
	$SugarQuery->select(array('id'));
	$SugarQuery->where()->equals('respondent_id_c',$respondent_id_c);
	$SugarQuery->where()->equals('dwhs_key',$dwhs_key);
	$SugarQuery->where()->equals('email_address_c',$email_address_c);
	$SurveyID = $SugarQuery->getOne();
	return $SurveyID;
}

/**
 * Function to handle different date formats
 */
function parseDates($dateString) {
    $possibleFormats = [
        'd-m-y H:i', 
        'Y-m-d H:i', 
        'd-m-Y H:i', 
        'm/d/Y H:i', 
        'd/m/Y H:i', 
        'd/m/Y h:i:s A',  // 25/11/2025 5:00:00 PM
        'd/m/Y H:i:s',    // 25/11/2025 17:00:00
        'm/d/Y h:i:s A',  // US format
        'Y-m-d H:i:s',    // ISO
        'Y-m-d\TH:i:sP',  // ISO with timezone
        'd-m-Y H:i:s',
        'd.m.Y H:i:s',
        'Y/m/d H:i:s',
        'Y/m/d',
        'Y-m-d',
        'd-m-Y',
        'd/m/Y',
        'm/d/Y',
        'd M Y',
        'M d, Y h:i A'
    ];
    foreach ($possibleFormats as $format) {
        $date = DateTime::createFromFormat($format, $dateString);
        if ($date && $date->getLastErrors()['warning_count'] == 0 && $date->getLastErrors()['error_count'] == 0) {
            return $date;
        }
    }
    return false; // Could not parse
}