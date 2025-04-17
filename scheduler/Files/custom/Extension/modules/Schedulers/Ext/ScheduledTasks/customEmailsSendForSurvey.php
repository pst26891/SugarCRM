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

        // Initialize SugarQuery to fetch survey data
        $sugarQuery = new SugarQuery();
        $sugarQuery->from(BeanFactory::newBean("SU_Survey") , ["alias" => "su", "team_security" => false, ]);

        // Join custom table to fetch additional fields
        $sugarQuery->joinTable("su_survey_cstm", ["joinType" => "INNER", "alias" => "cstm", "linkingTable" => true, ])
            ->on()
            ->equalsField("su.id", "cstm.id_c");

        $sugarQuery->joinTable("su_survey_accounts_c", ["joinType" => "INNER", "alias" => "ssa", "linkingTable" => true, ])
            ->on()
            ->equalsField("ssa.su_survey_accountssu_survey_idb", "cstm.id_c");

        $sugarQuery->joinTable("accounts", ["joinType" => "INNER", "alias" => "ac", "linkingTable" => true, ])
            ->on()
            ->equalsField("ac.id", "ssa.su_survey_accountsaccounts_ida");

        // Select required fields
        $sugarQuery->select(["su.id", "su.name", "su.survey_run_date", "su.date_entered", "su.date_modified", "ac.assigned_user_id", "ac.name account_name", ]);

        // Filter by modified date (today only) and non-deleted surveys
        $sugarQuery->where()
            ->addRaw("su.deleted=0 AND DATE(su.date_entered)= current_date()");
        $sugarQuery->orderBy("su.date_entered", "DESC");

        // Execute query
        $data = $sugarQuery->execute();

        $assignedUserWiseData = getSurveyDataAssignedUserWise($data);

        // Get the full site URL dynamically
        $siteUrl = $sugar_config['site_url'];

        // Construct email body with survey details
        foreach ($assignedUserWiseData as $userId => $surveys)
        {
            list($toEmail, $fullName) = getAssignedUserInfo($userId);

            // Extract the first survey's account name (assuming all surveys belong to the same account)
            $accountName = !empty($surveys) ? $surveys[0]["account_name"] : "Unknown Account";

            // Construct email body dynamically
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

            // **Use account name in the email subject**
            $subject = "Survey(s) for the account {$accountName} have been assigned to you";

            // **Send Email**
            sendSurveyEmail($body, $toEmail, $subject);
        }
    }
    catch(Exception $ex)
    {
        $GLOBALS["log"]->fatal("Error in sending Survey Data email: " . $ex->getMessage());
    }
    return true;
}
/**
 * Function to send survey email.
 */
function sendSurveyEmail($emailBody, $toEmail, $subject)
{
    require_once "modules/Emails/Email.php";
    require_once "include/SugarPHPMailer.php";

    try
    {
        // Email recipients
        $recipients = [$toEmail];

        // Initialize SugarCRM mailer
        $phpMailer = MailerFactory::getSystemDefaultMailer();
        $mailProtocol = $phpMailer->getMailTransmissionProtocol();

        $phpMailer->setSubject($subject);

        // Add recipients
        foreach ($recipients as $recipient)
        {
            $phpMailer->addRecipientsTo(new EmailIdentity($recipient, $recipient));
        }

        // Set email body as HTML
        $phpMailer->setHtmlBody($emailBody);

        // Send email
        $phpMailer->send();
    }
    catch(MailerException $me)
    {
        $GLOBALS["log"]->warn("Email send error ({$mailProtocol}): " . $me->getMessage());
    }
}
/**
 * Function to get assigned user email and name.
 */
function getAssignedUserInfo($userid)
{
    $sugarQuery = new SugarQuery();
    $sugarQuery->from(BeanFactory::newBean("Users") , ["alias" => "dco"], ["team_security" => false]);
    $sugarQuery->joinTable("email_addr_bean_rel", ["joinType" => "INNER", "alias" => "eabr", "linkingTable" => true, ])
        ->on()
        ->equalsField("dco.id", "eabr.bean_id");
    $sugarQuery->joinTable("email_addresses", ["joinType" => "INNER", "alias" => "ea", "linkingTable" => true, ])
        ->on()
        ->equalsField("ea.id", "eabr.email_address_id");
    $sugarQuery->select(["eabr.bean_id", "ea.email_address email", "first_name", "last_name", ]);
    $sugarQuery->where()
        ->equals("dco.deleted", 0);
    $sugarQuery->where()
        ->equals("eabr.deleted", 0);
    $sugarQuery->where()
        ->equals("dco.id", $userid);
    $sugarQuery->where()
        ->equals("bean_module", "users");

    $returnEmail = $sugarQuery->execute();

    $fullName = $returnEmail[0]["first_name"] . " " . $returnEmail[0]["last_name"];

    $assignedUserData = [$returnEmail[0]["email"], $fullName, $returnEmail[0]["bean_id"], ];

    return $assignedUserData;
}
/**
 * Function to group survey data by assigned user.
 */
function getSurveyDataAssignedUserWise($data)
{
    $surveyData = [];
    foreach ($data as $row)
    {
        $surveyData[$row["assigned_user_id"]][] = ["id" => $row["id"], "name" => $row["name"], "survey_run_date" => $row["survey_run_date"], "date_entered" => $row["date_entered"], "date_modified" => $row["date_modified"], "assigned_user_id" => $row["assigned_user_id"], "account_name" => $row["account_name"], ];
    }
    return $surveyData;
}

