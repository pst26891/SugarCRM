<?php
// Add job string for execution
$job_strings[] = "customEmailsSendForSurvey";

/**
 * Custom function to fetch survey data and send notification emails.
 */
function customEmailsSendForSurvey()
{
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
            list($toEmail, $fullName) = getAssignedUserInfo($userId);

            $accountName = !empty($surveys) ? $surveys[0]["account_name"] : "Unknown Account";

            $body = "Dear User, <br><br>Survey record for the account <b>{$accountName}</b> has been assigned to you. Please see the below table with survey records - <br><br>";
            $body .= "<table border='1' style='border-collapse:collapse'>";
            $body .= "<tdead><tr><td style='padding:5px'>Sr. No.</th><td style='padding:5px'>Date of Survey</th><td style='padding:5px'>Survey Record Name</th><td style='padding:5px'>Survey Link</th></tr></thead><tbody>";

            $inc = 1;
            foreach ($surveys as $survey)
            {
                $survey_link = $siteUrl . "/#SU_Survey/" . $survey["id"];
                $body .= "<tr><td style='padding:5px'>{$inc}</td>
                              <td style='padding:5px'>{$survey["survey_run_date"]}</td>
                              <td style='padding:5px'>{$survey["name"]}</td>
                              <td style='padding:5px'><a href='{$survey_link}'>Click Here</a></td></tr>";
                $inc++;
            }

            $body .= "</tbody></table><br><br>Thanks,<br>Habasit";

            $subject = "Survey(s) for the account {$accountName} have been assigned to you";

            sendSurveyEmail($body, $toEmail, $subject);
        }
    }
    catch(Exception $ex)
    {
        $GLOBALS["log"]->fatal("Error in sending Survey Data email: " . $ex->getMessage());
    }
    return true;
}

function sendSurveyEmail($emailBody, $toEmail, $subject)
{
    require_once "modules/Emails/Email.php";
    require_once "include/SugarPHPMailer.php";

    try
    {
        $recipients = [$toEmail];

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
              WHERE u.id = '{$userid}' AND u.deleted = 0 AND eabr.primary_address=1";

    $result = $db->query($query);
    $row = $db->fetchByAssoc($result);

    $fullName = $row["first_name"] . " " . $row["last_name"];
    return [$row["email"], $fullName, $row["bean_id"]];
}
