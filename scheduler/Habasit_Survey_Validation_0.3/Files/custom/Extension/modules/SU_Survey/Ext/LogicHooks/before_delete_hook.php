<?php

    $hook_array['before_delete'][] = Array(
        1,
        'Update related Account NPS Score',
        'custom/modules/SU_Survey/update_related_account.php',
        'update_related_account',
        'before_delete_update'
    );
?>