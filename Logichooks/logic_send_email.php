<?php
if (!defined('sugarEntry') || !sugarEntry) die('Not A Valid Entry Point');

class logic_send_email {
	
    function send_email($bean, $event, $arguments) {
       try
    {
        global $db, $GLOBALS, $sugar_config;



        // Fetch survey data using DBManager
        $query = "SELECT su.id, su.name, su.survey_run_date, 
                         ac.assigned_user_id, ac.name AS account_name
                  FROM su_survey su
                  INNER JOIN su_survey_cstm cstm ON su.id = cstm.id_c
                  INNER JOIN su_survey_accounts_c ssa ON ssa.su_survey_accountssu_survey_idb = cstm.id_c
                  INNER JOIN accounts ac ON ac.id = ssa.su_survey_accountsaccounts_ida
                  WHERE su.deleted = 0 AND DATE(su.date_entered) = CURRENT_DATE()
                  ORDER BY su.date_entered DESC";

        $result = $db->query($query);

        $groupedSurveys = [];
        while ($row = $db->fetchByAssoc($result)) {
           $groupedSurveys[$row['assigned_user_id']][] = $row;
        }

        // Get the full site URL dynamically
        $siteUrl = $sugar_config['site_url'];

        // Construct email body with survey details
        foreach ($groupedSurveys as $userId => $surveys)
        {
            list($toEmail, $fullName) = $this->getAssignedUserInfo($userId);

            $accountName = !empty($surveys) ? $surveys[0]["account_name"] : "Unknown Account";

            $body = "Dear User, <br><br>Survey record for the account <b>{$accountName}</b> has been assigned to you.<br><br>";
            $body .= "<table border='1' style='border-collapse:collapse'>";
            $body .= "<thead><tr><th style='padding:5px'>Sr No</th><th style='padding:5px'>Survey Name</th><th style='padding:5px'>Survey Run Date</th><th style='padding:5px'>Click Here</th></tr></thead><tbody>";

            $inc = 1;
            foreach ($surveys as $survey)
            {
                $survey_link = $siteUrl . "/index.php#SU_Survey/" . $survey["id"];
                $body .= "<tr><td style='padding:5px'>{$inc}</td>
                              <td style='padding:5px'>{$survey["name"]}</td>
                              <td style='padding:5px'>{$survey["survey_run_date"]}</td>
                              <td style='padding:5px'><a href='{$survey_link}'>View Survey</a></td></tr>";
                $inc++;
            }

            $body .= "</tbody></table><br><br>Thanks,<br>Habasit";

            $subject = "Survey(s) for the account {$accountName} have been assigned to you";

            $this->sendSurveyEmail($body, $toEmail, $subject);
        }
    }
    catch(Exception $ex)
    {
        $GLOBALS["log"]->fatal("Error in sending Survey Data email: " . $ex->getMessage());
    }
    }
     

function sendSurveyEmail($emailBody, $toEmail, $subject)
{
    require_once "modules/Emails/Email.php";
    require_once "include/SugarPHPMailer.php";

    try
    {
        $recipients = ['pushpendra.thakur@ambitsoftware.com'];

        $phpMailer = MailerFactory::getSystemDefaultMailer();
        $mailProtocol = $phpMailer->getMailTransmissionProtocol();

        $phpMailer->setSubject($subject);

        foreach ($recipients as $recipient)
        {
            $phpMailer->addRecipientsTo(new EmailIdentity($recipient, $recipient));
        }

        $phpMailer->setHtmlBody($emailBody);
        $phpMailer->send();
    }
    catch(MailerException $me)
    {
        $GLOBALS["log"]->warn("Email send error ({$mailProtocol}): " . $me->getMessage());
    }
}

function getAssignedUserInfo($userid)
{
    global $db;

    $query = "SELECT ea.email_address AS email, u.first_name, u.last_name, eabr.bean_id
              FROM users u
              INNER JOIN email_addr_bean_rel eabr ON u.id = eabr.bean_id AND eabr.bean_module = 'Users' AND eabr.deleted = 0
              INNER JOIN email_addresses ea ON ea.id = eabr.email_address_id
              WHERE u.id = '{$userid}' AND u.deleted = 0";

    $result = $db->query($query);
    $row = $db->fetchByAssoc($result);

    $fullName = $row["first_name"] . " " . $row["last_name"];
    return [$row["email"], $fullName, $row["bean_id"]];
}


 }
?>