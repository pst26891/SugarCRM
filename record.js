({
	extendsFrom: 'RecordView',
	
	initialize: function (options) {
		this.plugins = _.union(this.plugins, ['LinkedModel']);
		this._super('initialize', [options]);
		$("head").append($("<link rel='stylesheet' href='custom/modules/Com_Complaints/custom_mutiple_file.css' type='text/css' media='screen' />"));
		
		this.collection.on('data:sync:complete', this._buildFieldsReadonly, this);
		//this.on("render", this.onloadView, this);
		this.listenTo(this.collection, 'data:sync:complete', this.onloadView);

		this.model.addValidationTask('check_validation', _.bind(this._doFieldValidate, this));

		//this.context.on('button:save_button:click', this.save_button, this);
		this.context.on('button:save_complete_button:click', this.save_complete_button, this);
		this.context.on('button:edit_button:click', this.edit_button, this);
		this.context.on('button:cancel_button:click', this.cancel_button, this);
		this.context.on('button:send_purchase_order_email:click', this.send_purchase_order_email, this);
		// Ambit
		this.context.on('button:accept_credit_note_button:click', this.accept_credit_note_button, this);
		this.context.on('button:close_button:click', this.close_button, this);
		this.context.on('button:reject_credit_note_button:click', this.reject_credit_note_button, this);
		this.context.on('button:management_decision_button:click', this.management_decision_button, this);
		this.context.on('button:accept_analysis_button:click', this.accept_analysis_button, this);
		this.context.on('button:reject_analysis_button:click', this.reject_analysis_button, this);
		this.context.on('button:finalize_analysis_button:click', this.finalize_analysis_button, this);
		this.context.on('button:complete_analysis_appeal_button:click', this.complete_analysis_appeal_button, this);
		this.context.on('button:complete_credit_note_appeal_button:click', this.complete_credit_note_appeal_button, this);
		this.context.on('button:complete_management_decision_button:click', this.complete_management_decision_button, this);
		this.context.on('button:finalize_credit_note_button:click', this.finalize_credit_note_button, this);

		this.model.on("change:is_there_a_sample_c", this.RemoveRequired, this);
		//this.model.on("change:define_corrective_or_prevent_c", this.RemoveRequiredFromAction, this);
		this.model.on("change:fast_action_required_c", this.FastActionRequired, this);
		this.model.on("change:define_corrective_or_prevent_c", this.CorrectiveOrPrevent, this);
		this.model.on("change:accounts_com_complaints_1_name", this.SetOEMFields, this);
		this.model.on("change:accounts_com_complaints_2_name", this.SetEndUserFields, this);

		this.model.on("change:input_complete_c", this.HideShowSaveAndComplete, this);
		this.model.on("change:missing_information_log_t_c", this.HideShowSaveAndComplete, this);
		this.model.on("change:responsible_for_analysis_c", this.HideShowSaveAndComplete, this);
		this.model.on("change:define_corrective_or_prevent_c", this.HideShowSaveAndComplete, this);
		this.model.on("change:complaint_analysis_remarks_c", this.HideShowSaveAndComplete, this);

		
		this.model.on('change:complaint_status_c', this.copyFieldsData,this);

		this.model.on('change:compensation_amount_dd_c', this.populateCurrencyAnalysis,this);
		this.model.on('change:cost_of_additionals_dd_c', this.populateCurrencyAnalysis,this);
		this.model.on('change:compensation_amount_dec_c', this.populateCurrencyAnalysis,this);
		this.model.on('change:cost_of_additionals_dec_c', this.populateCurrencyAnalysis,this);

		this.model.on('change:compensation_amount_dd_app_c', this.populateCurrencyCreditNote,this);
		this.model.on('change:cost_of_additionals_dd_app_c', this.populateCurrencyCreditNote,this);
		this.model.on('change:compensation_amount_des_app_c', this.populateCurrencyCreditNote,this);
		this.model.on('change:cost_of_additionals_dec_app_c', this.populateCurrencyCreditNote,this);

		this.model.on('change:compensation_amount_dd_set_c', this.populateCurrencySettlement,this);
		this.model.on('change:cost_of_additionals_dd_set_c', this.populateCurrencySettlement,this);
		this.model.on('change:compensation_amount_dec_set_c', this.populateCurrencySettlement,this);
		this.model.on('change:cost_of_additionals_dec_set_c', this.populateCurrencySettlement,this);	
		
	},


		

	//events: {
        //On click of our "button" element
       // 'click [track=save_complete_button]': 'save_complete_button',
    	//},

	FastActionRequired: function(){
		if(!_.isEmpty(this.model.get('fast_action_required_c')) && typeof(this.model.previous('fast_action_required_c'))!=='undefined' && !_.isEqual(this.model.get('fast_action_required_c'),this.model.previous('fast_action_required_c'))){
		var self=this;
		var action_present = 'false';
		relatedAction = app.data.createRelatedCollection(this.model, 'com_complaints_act_actions_1');
		relatedAction.fetch({
			relate: true,
			success: _.bind(function (data) {
				if(data.length==0){
					var fast_action_required = self.model.get('fast_action_required_c');
					if(fast_action_required=='Yes'){
						app.alert.show('message-id', {
						messages: 'Please define actions against this Complaints in Actions sub-panel of Complaints after save.',
						autoClose: false
						});
					} 
				}
				// No Action Required		
			}, this),
			error: _.bind(function () {
				
			}, this),
		});
		}
	},

	CorrectiveOrPrevent: function(){
		if(!_.isEmpty(this.model.get('define_corrective_or_prevent_c')) && typeof(this.model.previous('define_corrective_or_prevent_c'))!=='undefined' && !_.isEqual(this.model.get('define_corrective_or_prevent_c'),this.model.previous('define_corrective_or_prevent_c'))
		 && this.model.get('complaint_status_c')=='Complaint Analysis'){
			var self=this;
			var action_present = 'false';
			relatedAction = app.data.createRelatedCollection(this.model, 'com_complaints_act_actions_1');
			relatedAction.fetch({
				relate: true,
				success: _.bind(function (data) {
					if(data.length==0){
						var corrective_or_prevent = self.model.get('define_corrective_or_prevent_c');
						if(corrective_or_prevent=='Yes'){
							app.alert.show('message-id', {
							messages: 'Please create an Action to send the Complaint for credit note acceptance.',
							autoClose: false
						});
					} 
				}
				// No Action Required		
			}, this),
			error: _.bind(function () {
				
			}, this),
			});
		}
	},

	RemoveRequired:function() {
		var c_status = this.model.get('complaint_status_c');
		//var is_there_y=this.model.get('is_there_a_sample_c'); 
		
		$('div [data-name="is_there_a_sample_c"]').change(function(){
			var is_there_y=$("input[name=is_there_a_sample_c]:checked").val()				
			if(is_there_y=='Yes'){
				if(c_status == 'Complaint Initiation' || c_status == 'Missing Information'){
					app.alert.show('add_unique_message_id_here', {
						level: 'info',
						messages: 'Please await the Return Purchase Order Number / Information before sending the material back to PU. <br><br> When you have the shipping information (tracking info of UPS, DHL, Post, etc.) please add the details to complaint in CMS tool. <br><br> The Return Purchase Order Number must be clearly visible on the return shipment for treatment at customs and back tracing at PU.',
						autoClose: false
					});
					setTimeout(function(){
						$('.alert-wrapper').each(function(){
							if($(this).is(':visible')){
								$(this).css('width','50%');
								$(this).children('.alert.alert-info').css('width','100%');
							}
						});
					}, 100);
				}	
			 }
        	});		
	},

	RemoveRequiredFromAction:function() {
		setTimeout(function () {
			$('.record-label[data-name="define_corrective_or_prevent_c"] span[data-required="required"]').addClass("hidden");
		},1000);
	},
	
	_buildFieldsReadonly:function(PanelField){
		var self = this;
		var complaint_status_p = self.model.get('complaint_status_c');
		var sub_status_p = self.model.get('sub_status_c');
		var noEditFields = new Array();		
		var pu_su_initiator;
		var pu_teator;
		var pu_analyst;
		var userId = SUGAR.App.user.get('id');
		var assign_type = self.model.get('complaint_assignment_c');
		var producing_unit = self.model.get('hcm_pu_master_id_c');
		var unit_name = self.model.get('unit_name_c');
		var type = 'save_complete_button'
		var model_id = self.model.get('id');
		var url = app.api.buildURL('Com_Complaints/SaveButtonAction/'+producing_unit+'/'+userId+'/'+assign_type+'/'+unit_name+'/'+model_id+'/comment_log/'+type);
		app.api.call('GET', url, null, {
        	success: _.bind(function (data) {
	            if (data[0] === 'success') {
				if(($.inArray('PU Initiator',data[1]) !== -1) || ($.inArray('SU Initiator',data[1]) !== -1)){
					pu_su_initiator = 1;
				}
				if($.inArray('Treator PU',data[1]) !== -1){
					pu_teator = 1;
				}
				if($.inArray('Analyst PU',data[1]) !== -1 ){
					pu_analyst = 1;
				}		
				
				if($.inArray('Credit Admin PU',data[1]) !== -1 ){
					credit_admin_pu = 1;
				}

			
				if((complaint_status_p=='Complaint Initiation') && pu_su_initiator == 1){
					var myarray = ['LBL_RECORD_BODY','LBL_SHOW_MORE','LBL_RECORDVIEW_PANEL1','LBL_RECORDVIEW_PANEL2','LBL_RECORDVIEW_PANEL12', 'LBL_RECORDVIEW_PANEL20','LBL_RECORDVIEW_PANEL21','LBL_RECORDVIEW_PANEL22','LBL_RECORDVIEW_PANEL23','LBL_RECORDVIEW_PANEL24','LBL_RECORDVIEW_PANEL29'];
					if(complaint_status_p=='Complaint Initiation'){
						myarray.push('LBL_RECORD_HEADER','LBL_RECORDVIEW_PANEL29');
					}
				}
				
				if(complaint_status_p=='Check Complaint Completeness' && pu_teator ==1){
					var myarray = ['LBL_RECORDVIEW_PANEL7','LBL_RECORDVIEW_PANEL12','LBL_RECORDVIEW_PANEL14','LBL_RECORDVIEW_PANEL20','LBL_RECORDVIEW_PANEL21','LBL_RECORDVIEW_PANEL22','LBL_RECORDVIEW_PANEL23','LBL_RECORDVIEW_PANEL24','LBL_RECORDVIEW_PANEL29'];
				}
				
				if((complaint_status_p=='Missing Information') && pu_su_initiator == 1){
					var myarray = ['LBL_RECORD_BODY','LBL_SHOW_MORE','LBL_RECORDVIEW_PANEL1','LBL_RECORDVIEW_PANEL2','LBL_RECORDVIEW_PANEL12', 'LBL_RECORDVIEW_PANEL20','LBL_RECORDVIEW_PANEL21','LBL_RECORDVIEW_PANEL22','LBL_RECORDVIEW_PANEL23','LBL_RECORDVIEW_PANEL24','LBL_RECORDVIEW_PANEL29'];
				}
				
				if((complaint_status_p=='Complaint Analysis' ) && pu_analyst == 1){
					var myarray = ['LBL_RECORDVIEW_PANEL15','LBL_RECORDVIEW_PANEL20','LBL_RECORDVIEW_PANEL21','LBL_RECORDVIEW_PANEL22','LBL_RECORDVIEW_PANEL23','LBL_RECORDVIEW_PANEL24','LBL_RECORDVIEW_PANEL8','LBL_RECORDVIEW_PANEL16','LBL_RECORDVIEW_PANEL13','LBL_RECORDVIEW_PANEL18','LBL_RECORDVIEW_PANEL29','LBL_RECORDVIEW_PANEL12','LBL_RECORDVIEW_PANEL17'];
					$('div [data-name="is_there_a_sample_c"]').attr("readonly","true");
					$("div [data-name='is_there_a_sample_c']").css("pointer-events","none");
				}
			
				if((complaint_status_p=='Credit Note Acceptance') && pu_su_initiator == 1){ 
					var myarray = ['LBL_RECORDVIEW_PANEL6','LBL_RECORDVIEW_PANEL29'];
					$('div [data-name="is_there_a_sample_c"]').attr("readonly","true");
					$("div [data-name='is_there_a_sample_c']").css("pointer-events","none");
				}
				
				if((complaint_status_p=='Credit Note Appeal Treatment') && pu_analyst == 1){
					var myarray = ['LBL_RECORDVIEW_PANEL15','LBL_RECORDVIEW_PANEL20','LBL_RECORDVIEW_PANEL21','LBL_RECORDVIEW_PANEL22','LBL_RECORDVIEW_PANEL23','LBL_RECORDVIEW_PANEL24','LBL_RECORDVIEW_PANEL8','LBL_RECORDVIEW_PANEL16','LBL_RECORDVIEW_PANEL13','LBL_RECORDVIEW_PANEL18','LBL_RECORDVIEW_PANEL29','LBL_RECORDVIEW_PANEL12','LBL_RECORDVIEW_PANEL17'];
					$('div [data-name="is_there_a_sample_c"]').attr("readonly","true");
					$("div [data-name='is_there_a_sample_c']").css("pointer-events","none");
					
					$('div [data-name="credit_note_acceptance_attch_c"]').attr("readonly","true");
					$("div [data-name='credit_note_acceptance_attch_c']").css("pointer-events","none");
					$('div [data-name="creditnote_appealinfo_attach_c"]').attr("readonly","true");
					$("div [data-name='creditnote_appealinfo_attach_c']").css("pointer-events","none");
					$('div [data-name="management_decision_attach_c"]').attr("readonly","true");
					$("div [data-name='management_decision_attach_c']").css("pointer-events","none");
					$('div [data-name="analysis_acpt_cmnt_attach_c"]').attr("readonly","true");
					$("div [data-name='analysis_acpt_cmnt_attach_c']").css("pointer-events","none");
					$('div [data-name="analys_reject_cmnt_attach_c"]').attr("readonly","true");
					$("div [data-name='analys_reject_cmnt_attach_c']").css("pointer-events","none");
				}
				
				if((complaint_status_p=='Finalize Management Decision') && pu_analyst == 1){
					var myarray = ['LBL_RECORDVIEW_PANEL15','LBL_RECORDVIEW_PANEL20','LBL_RECORDVIEW_PANEL21','LBL_RECORDVIEW_PANEL22','LBL_RECORDVIEW_PANEL23','LBL_RECORDVIEW_PANEL24','LBL_RECORDVIEW_PANEL8','LBL_RECORDVIEW_PANEL16','LBL_RECORDVIEW_PANEL13','LBL_RECORDVIEW_PANEL18','LBL_RECORDVIEW_PANEL29','LBL_RECORDVIEW_PANEL12','LBL_RECORDVIEW_PANEL17'];
					$('div [data-name="is_there_a_sample_c"]').attr("readonly","true");
					$("div [data-name='is_there_a_sample_c']").css("pointer-events","none");
					
					$('div [data-name="credit_note_acceptance_attch_c"]').attr("readonly","true");
					$("div [data-name='credit_note_acceptance_attch_c']").css("pointer-events","none");
					$('div [data-name="creditnote_appealinfo_attach_c"]').attr("readonly","true");
					$("div [data-name='creditnote_appealinfo_attach_c']").css("pointer-events","none");
					$('div [data-name="management_decision_attach_c"]').attr("readonly","true");
					$("div [data-name='management_decision_attach_c']").css("pointer-events","none");
					$('div [data-name="analysis_acpt_cmnt_attach_c"]').attr("readonly","true");
					$("div [data-name='analysis_acpt_cmnt_attach_c']").css("pointer-events","none");
					$('div [data-name="analys_reject_cmnt_attach_c"]').attr("readonly","true");
					$("div [data-name='analys_reject_cmnt_attach_c']").css("pointer-events","none");
					
					$('div [data-name="credit_note_appealcom_attach_c"]').attr("readonly","true");
					$("div [data-name='credit_note_appealcom_attach_c']").css("pointer-events","none");
					
				}
				
				if((complaint_status_p=='Finalizing Analysis' ) && pu_analyst == 1){
					var myarray = ['LBL_RECORDVIEW_PANEL15','LBL_RECORDVIEW_PANEL20','LBL_RECORDVIEW_PANEL21','LBL_RECORDVIEW_PANEL22','LBL_RECORDVIEW_PANEL23','LBL_RECORDVIEW_PANEL24','LBL_RECORDVIEW_PANEL8','LBL_RECORDVIEW_PANEL16','LBL_RECORDVIEW_PANEL13','LBL_RECORDVIEW_PANEL18','LBL_RECORDVIEW_PANEL29','LBL_RECORDVIEW_PANEL12'];
					$('div [data-name="is_there_a_sample_c"]').attr("readonly","true");
					$("div [data-name='is_there_a_sample_c']").css("pointer-events","none");
					
					$('div [data-name="credit_note_acceptance_attch_c"]').attr("readonly","true");
					$("div [data-name='credit_note_acceptance_attch_c']").css("pointer-events","none");
					$('div [data-name="creditnote_appealinfo_attach_c"]').attr("readonly","true");
					$("div [data-name='creditnote_appealinfo_attach_c']").css("pointer-events","none");
					$('div [data-name="management_decision_attach_c"]').attr("readonly","true");
					$("div [data-name='management_decision_attach_c']").css("pointer-events","none");
					$('div [data-name="analysis_acpt_cmnt_attach_c"]').attr("readonly","true");
					$("div [data-name='analysis_acpt_cmnt_attach_c']").css("pointer-events","none");
					$('div [data-name="analys_reject_cmnt_attach_c"]').attr("readonly","true");
					$("div [data-name='analys_reject_cmnt_attach_c']").css("pointer-events","none");
					
					$('div [data-name="credit_note_appealcom_attach_c"]').attr("readonly","true");
					$("div [data-name='credit_note_appealcom_attach_c']").css("pointer-events","none");
					$('div [data-name="final_management_attachment_c"]').attr("readonly","true");
					$("div [data-name='final_management_attachment_c']").css("pointer-events","none");
				}
				
				if((complaint_status_p=='Acceptance of Analysis' ) && pu_su_initiator == 1){
					var myarray = ['LBL_RECORDVIEW_PANEL20','LBL_RECORDVIEW_PANEL21','LBL_RECORDVIEW_PANEL22','LBL_RECORDVIEW_PANEL23','LBL_RECORDVIEW_PANEL24'];
					$('div [data-name="is_there_a_sample_c"]').attr("readonly","true");
					$("div [data-name='is_there_a_sample_c']").css("pointer-events","none");
				}
				
				
				if((complaint_status_p=='Analysis Appeal Treatment' ) && pu_analyst == 1){
					var myarray = ['LBL_RECORDVIEW_PANEL15','LBL_RECORDVIEW_PANEL20','LBL_RECORDVIEW_PANEL21','LBL_RECORDVIEW_PANEL22','LBL_RECORDVIEW_PANEL23','LBL_RECORDVIEW_PANEL24','LBL_RECORDVIEW_PANEL8','LBL_RECORDVIEW_PANEL16','LBL_RECORDVIEW_PANEL13','LBL_RECORDVIEW_PANEL18','LBL_RECORDVIEW_PANEL29','LBL_RECORDVIEW_PANEL12'];
					$('div [data-name="is_there_a_sample_c"]').attr("readonly","true");
					$("div [data-name='is_there_a_sample_c']").css("pointer-events","none");
					
					$('div [data-name="credit_note_acceptance_attch_c"]').attr("readonly","true");
					$("div [data-name='credit_note_acceptance_attch_c']").css("pointer-events","none");
					$('div [data-name="creditnote_appealinfo_attach_c"]').attr("readonly","true");
					$("div [data-name='creditnote_appealinfo_attach_c']").css("pointer-events","none");
					$('div [data-name="management_decision_attach_c"]').attr("readonly","true");
					$("div [data-name='management_decision_attach_c']").css("pointer-events","none");
					$('div [data-name="analysis_acpt_cmnt_attach_c"]').attr("readonly","true");
					$("div [data-name='analysis_acpt_cmnt_attach_c']").css("pointer-events","none");
					$('div [data-name="analys_reject_cmnt_attach_c"]').attr("readonly","true");
					$("div [data-name='analys_reject_cmnt_attach_c']").css("pointer-events","none");
					
					$('div [data-name="credit_note_appealcom_attach_c"]').attr("readonly","true");
					$("div [data-name='credit_note_appealcom_attach_c']").css("pointer-events","none");
					$('div [data-name="final_management_attachment_c"]').attr("readonly","true");
					$("div [data-name='final_management_attachment_c']").css("pointer-events","none");
					
				}
				
				if(complaint_status_p=='Credit Note Settlement'){ 
					var myarray = ['LBL_RECORDVIEW_PANEL27'];
					$('div [data-name="is_there_a_sample_c"]').attr("readonly","true");
					$("div [data-name='is_there_a_sample_c']").css("pointer-events","none");
					
					$('div [data-name="credit_note_acceptance_attch_c"]').attr("readonly","true");
					$("div [data-name='credit_note_acceptance_attch_c']").css("pointer-events","none");
					$('div [data-name="creditnote_appealinfo_attach_c"]').attr("readonly","true");
					$("div [data-name='creditnote_appealinfo_attach_c']").css("pointer-events","none");
					$('div [data-name="management_decision_attach_c"]').attr("readonly","true");
					$("div [data-name='management_decision_attach_c']").css("pointer-events","none");
					$('div [data-name="analysis_acpt_cmnt_attach_c"]').attr("readonly","true");
					$("div [data-name='analysis_acpt_cmnt_attach_c']").css("pointer-events","none");
					$('div [data-name="analys_reject_cmnt_attach_c"]').attr("readonly","true");
					$("div [data-name='analys_reject_cmnt_attach_c']").css("pointer-events","none");
					
					$('div [data-name="credit_note_appealcom_attach_c"]').attr("readonly","true");
					$("div [data-name='credit_note_appealcom_attach_c']").css("pointer-events","none");
					$('div [data-name="final_management_attachment_c"]').attr("readonly","true");
					$("div [data-name='final_management_attachment_c']").css("pointer-events","none");
				}
				
				if(complaint_status_p=='Final Complaint Acceptance'){ 
					var myarray = ['LBL_RECORDVIEW_PANEL28'];
					$('div [data-name="is_there_a_sample_c"]').attr("readonly","true");
					$("div [data-name='is_there_a_sample_c']").css("pointer-events","none");
					
					$('div [data-name="credit_note_acceptance_attch_c"]').attr("readonly","true");
					$("div [data-name='credit_note_acceptance_attch_c']").css("pointer-events","none");
					$('div [data-name="creditnote_appealinfo_attach_c"]').attr("readonly","true");
					$("div [data-name='creditnote_appealinfo_attach_c']").css("pointer-events","none");
					$('div [data-name="management_decision_attach_c"]').attr("readonly","true");
					$("div [data-name='management_decision_attach_c']").css("pointer-events","none");
					$('div [data-name="analysis_acpt_cmnt_attach_c"]').attr("readonly","true");
					$("div [data-name='analysis_acpt_cmnt_attach_c']").css("pointer-events","none");
					$('div [data-name="analys_reject_cmnt_attach_c"]').attr("readonly","true");
					$("div [data-name='analys_reject_cmnt_attach_c']").css("pointer-events","none");
					
					$('div [data-name="credit_note_appealcom_attach_c"]').attr("readonly","true");
					$("div [data-name='credit_note_appealcom_attach_c']").css("pointer-events","none");
					$('div [data-name="final_management_attachment_c"]').attr("readonly","true");
					$("div [data-name='final_management_attachment_c']").css("pointer-events","none");
				}
				
				if( Array.isArray(myarray) && myarray.length > 0) {
					if($.inArray('LBL_RECORD_BODY', myarray) === -1) {
						$('div [data-name="fast_action_required_c"]').attr("readonly","true");
						$("div [data-name='fast_action_required_c']").css("pointer-events","none");
					}
										
					if($.inArray('LBL_RECORDVIEW_PANEL8', myarray) === -1) {
						$('div [data-name="define_corrective_or_prevent_c"]').attr("readonly","true");
						$("div [data-name='define_corrective_or_prevent_c']").css("pointer-events","none");
					}
					
					if($.inArray('LBL_RECORDVIEW_PANEL2', myarray) === -1) {
						$('div [data-name="attachment_of_defect_c"]').attr("readonly","true");
						$("div [data-name='attachment_of_defect_c']").css("pointer-events","none");
					}
					
					if($.inArray('LBL_RECORDVIEW_PANEL15', myarray) === -1) {
						$('div [data-name="analysis_attachment_c"]').attr("readonly","true");
						$("div [data-name='analysis_attachment_c']").css("pointer-events","none");
					}
					
					if($.inArray('LBL_RECORDVIEW_PANEL13 ', myarray) === -1) {
						$('div [data-name="finaldecisionanalysis_attach_c"]').attr("readonly","true");
						$("div [data-name='finaldecisionanalysis_attach_c']").css("pointer-events","none");				
						// $('div [data-name="final_credit_note_attachment_c"]').attr("readonly","true");
						// $("div [data-name='final_credit_note_attachment_c']").css("pointer-events","none");
						
					}
					
					if(complaint_status_p=='Finalizing Analysis'){
						if($.inArray('LBL_RECORDVIEW_PANEL13 ', myarray) === -1) {
						$('div [data-name="finaldecisionanalysis_attach_c"]').attr("readonly","false");
						$("div [data-name='finaldecisionanalysis_attach_c']").css("pointer-events","auto");				
						// $('div [data-name="final_credit_note_attachment_c"]').attr("readonly","true");
						// $("div [data-name='final_credit_note_attachment_c']").css("pointer-events","none");
						}
					}
					
					if($.inArray('LBL_RECORDVIEW_PANEL18 ', myarray) === -1) {
						$('div [data-name="final_management_attachment_c"]').attr("readonly","true");
						$("div [data-name='final_management_attachment_c']").css("pointer-events","none");
						$('div [data-name="appeal_analyiss_attachment_c"]').attr("readonly","true");
						$("div [data-name='appeal_analyiss_attachment_c']").css("pointer-events","none");	
						$('div [data-name="credit_note_appealcom_attach_c"]').attr("readonly","true");
						$("div [data-name='credit_note_appealcom_attach_c']").css("pointer-events","none");
					}
					
					if(complaint_status_p=='Finalize Management Decision'){
						if($.inArray('LBL_RECORDVIEW_PANEL18 ', myarray) === -1) {
						$('div [data-name="final_management_attachment_c"]').attr("readonly","false");
						$("div [data-name='final_management_attachment_c']").css("pointer-events","auto");
						$('div [data-name="appeal_analyiss_attachment_c"]').attr("readonly","true");
						$("div [data-name='appeal_analyiss_attachment_c']").css("pointer-events","none");
						}
					}
					if(complaint_status_p=='Analysis Appeal Treatment'){
						if($.inArray('LBL_RECORDVIEW_PANEL18 ', myarray) === -1) {
						$('div [data-name="appeal_analyiss_attachment_c"]').attr("readonly","false");
						$("div [data-name='appeal_analyiss_attachment_c']").css("pointer-events","auto");
						$('div [data-name="final_management_attachment_c"]').attr("readonly","true");
						$("div [data-name='final_management_attachment_c']").css("pointer-events","none");
						
						}
					}
									
					
				}
				
				/*
				if((complaint_status_p=='Complaint Initiation' || complaint_status_p=='Missing Information') && (pu_analyst == 1 || pu_teator == 1)){
					var myarray = ['LBL_RECORDVIEW_PANEL12', 'LBL_RECORDVIEW_PANEL20','LBL_RECORDVIEW_PANEL21','LBL_RECORDVIEW_PANEL22','LBL_RECORDVIEW_PANEL23','LBL_RECORDVIEW_PANEL24','LBL_RECORDVIEW_PANEL29'];
				}
				
				if((complaint_status_p=='Complaint Initiation' || complaint_status_p=='Missing Information') && pu_su_initiator == 1){
					var myarray = ['LBL_RECORD_BODY','LBL_SHOW_MORE','LBL_RECORDVIEW_PANEL1','LBL_RECORDVIEW_PANEL2','LBL_RECORDVIEW_PANEL12', 'LBL_RECORDVIEW_PANEL20','LBL_RECORDVIEW_PANEL21','LBL_RECORDVIEW_PANEL22','LBL_RECORDVIEW_PANEL23','LBL_RECORDVIEW_PANEL24','LBL_RECORDVIEW_PANEL29'];
					if(complaint_status_p=='Complaint Initiation'){
						myarray.push('LBL_RECORD_HEADER','LBL_RECORDVIEW_PANEL29');
					}
				} else if(complaint_status_p=='Check Complaint Completeness' && pu_teator ==1){
					var myarray = ['LBL_RECORDVIEW_PANEL7','LBL_RECORDVIEW_PANEL12','LBL_RECORDVIEW_PANEL14','LBL_RECORDVIEW_PANEL20','LBL_RECORDVIEW_PANEL21','LBL_RECORDVIEW_PANEL22','LBL_RECORDVIEW_PANEL23','LBL_RECORDVIEW_PANEL24','LBL_RECORDVIEW_PANEL29'];
				} else if((complaint_status_p=='Complaint Analysis' || complaint_status_p=='Finalize Management Decision' || complaint_status_p=='Finalizing Analysis' || complaint_status_p=='Analysis Appeal Treatment' || complaint_status_p=='Credit Note Appeal Treatment') && pu_analyst == 1){
					var myarray = ['LBL_RECORDVIEW_PANEL15','LBL_RECORDVIEW_PANEL20','LBL_RECORDVIEW_PANEL21','LBL_RECORDVIEW_PANEL22','LBL_RECORDVIEW_PANEL23','LBL_RECORDVIEW_PANEL24','LBL_RECORDVIEW_PANEL8','LBL_RECORDVIEW_PANEL16','LBL_RECORDVIEW_PANEL13','LBL_RECORDVIEW_PANEL18','LBL_RECORDVIEW_PANEL29','LBL_RECORDVIEW_PANEL12'];
				} else if(complaint_status_p=='Credit Note Acceptance'){ 
					var myarray = ['LBL_RECORDVIEW_PANEL6','LBL_RECORDVIEW_PANEL29'];
				} else if(complaint_status_p=='Credit Note Approval'){ 
					var myarray = ['LBL_RECORDVIEW_PANEL6','LBL_RECORDVIEW_PANEL26','LBL_RECORDVIEW_PANEL29'];
				} else if(complaint_status_p=='Credit Note Settlement'){ 
					var myarray = ['LBL_RECORDVIEW_PANEL9','LBL_RECORDVIEW_PANEL27','LBL_RECORDVIEW_PANEL29'];
				} else if(complaint_status_p=='Complaint Approval'){ 
					var myarray = ['LBL_RECORDVIEW_PANEL11','LBL_RECORDVIEW_PANEL29'];
				}
				
				//131
				if(complaint_status_p=='Complaint Analysis' || complaint_status_p=='Finalize Management Decision' || complaint_status_p=='Credit Note Appeal Treatment'){
					var myarray = ['LBL_RECORDVIEW_PANEL17'];
				}
								
				if(complaint_status_p=='Complaint Analysis' && pu_analyst == 1){ 
					myarray.push("LBL_RECORDVIEW_PANEL12","LBL_RECORDVIEW_PANEL29","LBL_RECORDVIEW_PANEL15","LBL_RECORDVIEW_PANEL8","LBL_RECORDVIEW_PANEL16","LBL_RECORDVIEW_PANEL17");
				}

				if( Array.isArray(myarray) && myarray.length > 0) {
					if($.inArray('LBL_RECORD_BODY', myarray) === -1) {
						$('div [data-name="fast_action_required_c"]').attr("readonly","true");
						$("div [data-name='fast_action_required_c']").css("pointer-events","none");
					}
					
					if($.inArray('LBL_RECORDVIEW_PANEL12', myarray) === -1) {
						$('div [data-name="is_there_a_sample_c"]').attr("readonly","true");
						$("div [data-name='is_there_a_sample_c']").css("pointer-events","none");
					}
					
					if($.inArray('LBL_RECORDVIEW_PANEL8', myarray) === -1) {
						$('div [data-name="define_corrective_or_prevent_c"]').attr("readonly","true");
						$("div [data-name='define_corrective_or_prevent_c']").css("pointer-events","none");
					}
					
					if($.inArray('LBL_RECORDVIEW_PANEL2', myarray) === -1) {
						$('div [data-name="attachment_of_defect_c"]').attr("readonly","true");
						$("div [data-name='attachment_of_defect_c']").css("pointer-events","none");
					}
					
					if($.inArray('LBL_RECORDVIEW_PANEL15', myarray) === -1) {
						$('div [data-name="analysis_attachment_c"]').attr("readonly","true");
						$("div [data-name='analysis_attachment_c']").css("pointer-events","none");
					}
					
					if($.inArray('LBL_RECORDVIEW_PANEL13 ', myarray) === -1) {
						$('div [data-name="finaldecisionanalysis_attach_c"]').attr("readonly","true");
						$("div [data-name='finaldecisionanalysis_attach_c']").css("pointer-events","none");				
						$('div [data-name="final_credit_note_attachment_c"]').attr("readonly","true");
						$("div [data-name='final_credit_note_attachment_c']").css("pointer-events","none");
						
					}
					
					if($.inArray('LBL_RECORDVIEW_PANEL18 ', myarray) === -1) {
						$('div [data-name="final_management_attachment_c"]').attr("readonly","true");
						$("div [data-name='final_management_attachment_c']").css("pointer-events","none");
						$('div [data-name="appeal_analyiss_attachment_c"]').attr("readonly","true");
						$("div [data-name='appeal_analyiss_attachment_c']").css("pointer-events","none");
					}
				}
				*/
				var panelList=self.meta.panels;
				$(panelList).each(function(){
					//console.log($.inArray(this.label, myarray)+'Labels'+this.label);
										 
					if( $.inArray(this.label, myarray) === -1 ) {

						$(this.fields).each(function(){
							if(this.name!='analysis_result_remark_c' && this.name!='application_info_remarks_c' && this.name!='defect_related_info_remark_c'){
								$('.record-edit-link-wrapper[data-name=' + this.name + ']').remove();
								self.noEditFields.push(this.name);
								var renderField = self.getField(this.name); 
								if(renderField!=undefined){
									renderField.setDisabled(true);
								}
							}
						});
					}
				});
				
				if(complaint_status_p=='Check Complaint Completeness' && pu_teator ==1){
					var renderField = this.getField('return_purchs_order_no_desc_c'); 
						if(renderField!=undefined && renderField!=null){
							renderField.setDisabled(true);
						}
					$('div [data-name="is_there_a_sample_c"]').attr("readonly","true");
					$("div [data-name='is_there_a_sample_c']").css("pointer-events","none");	
				}
				
				if((complaint_status_p=='Complaint Initiation' || complaint_status_p=='Missing Information') && pu_su_initiator == 1){
					var renderField = this.getField('purchase_order_number_c'); 
						if(renderField!=undefined && renderField!=null){
							renderField.setDisabled(true);
						}
					var renderField = this.getField('sample_description_c'); 
						if(renderField!=undefined && renderField!=null){
							renderField.setDisabled(true);
						}
				}

				if((complaint_status_p=='Complaint Analysis' || complaint_status_p=='Finalize Management Decision' || complaint_status_p=='Finalizing Analysis' || complaint_status_p=='Analysis Appeal Treatment' || complaint_status_p=='Credit Note Appeal Treatment') && (pu_analyst == 1 || pu_teator == 1)){
					var renderField = this.getField('return_purchs_order_no_desc_c'); 
						if(renderField!=undefined && renderField!=null){
							renderField.setDisabled(true);
						}
					var renderField = this.getField('is_there_a_sample_c'); 
						if(renderField!=undefined && renderField!=null){
							renderField.setDisabled(true);
						}
				}

			// readonly comments fiedls- updated from drawer
			var renderField = this.getField('finalcreditcomments_c'); 
						if(renderField!=undefined && renderField!=null){
							renderField.setDisabled(true);
						}

			var renderField = this.getField('finaldecisioncapu_c'); 
						if(renderField!=undefined && renderField!=null){
							renderField.setDisabled(true);
						}
				
				// remove readonly comments fiedls- 294-302
				if(complaint_status_p=='Credit Note Appeal Treatment' ){
					var renderField = this.getField('credit_note_appeal_comments_c'); 
						if(renderField!=undefined && renderField!=null){
							renderField.setDisabled(false);
						}
				}
				if(complaint_status_p=='Finalize Management Decision' ){
					var renderField = this.getField('final_management_decision_c'); 
						if(renderField!=undefined && renderField!=null){
							renderField.setDisabled(false);
						}
				}
				if(complaint_status_p=='Analysis Appeal Treatment' ){
					var renderField = this.getField('appeal_analysis_comments_t_c'); 
						if(renderField!=undefined && renderField!=null){
							renderField.setDisabled(false);
						}
				}
				if(complaint_status_p=='Finalizing Analysis' ){
					var renderField = this.getField('final_decision_on_analysis_l_c'); 
						if(renderField!=undefined && renderField!=null){
							renderField.setDisabled(false);
						}
				}
				if((complaint_status_p=='Credit Note Acceptance' ) && (sub_status_p == 'Assigned for Credit Note Acceptance' || sub_status_p == 'First Credit Note Acceptance  in Progress' || sub_status_p== 'First Credit Note Accepted')){
					var renderField = this.getField('credit_note_acceptance_comme_c'); 
						if(renderField!=undefined && renderField!=null){
							renderField.setDisabled(false);
						}
				}			
			// end
				
                }
            }, this),
        });

		
  	},	
	
	
	SetReadonlyForALL:function()
	{
		/*
		var renderField = this.getField('producing_unit_c'); 
		if(renderField!=undefined && renderField!=null && this.model.get('complaint_status_c')!='Complaint Initiation'){
			renderField.setDisabled(true);
		} else if((renderField!=undefined && renderField!=null) && (this.model.get('product_code_c')!=undefined && this.model.get('product_code_c')!=null)){
			var site_description = this.model.get('entity_of_prd_origin_c').replace(/[_\s]/g, '-').replace(/[^A-Za-z0-9-\s]/gi, '');
			var producing_unit_name = this.model.get('producing_unit_c').replace(/[_\s]/g, '-').replace(/[^A-Za-z0-9-\s]/gi, '');
			console.log(site_description+"**"+producing_unit_name);
			if(site_description.trim()==producing_unit_name.trim()){
				renderField.setDisabled(true);
			}
		} else{
			// No Action Required
		}
		*/
		var renderField = this.getField('unit_name_c'); 
		if(renderField!=undefined){
			renderField.setDisabled(true);
		}		
	},
	
	HideShowSaveAndComplete: function(){
		var self = this;
		var status = self.model.get('complaint_status_c');
		var sub_status = self.model.get('sub_status_c');
		console.log('substatus in if'+sub_status);
		var assigned_user = self.model.get('assigned_user_name');
		var action = self.model.get('define_corrective_or_prevent_c');
		var remark_on_act = self.model.get('complaint_analysis_remarks_c');
		var input_complete = self.model.get('input_complete_c');
		var missing_information_log = self.model.get('missing_information_log_t_c');
		var responsible_for_analysis = self.model.get('responsible_for_analysis_c');

		if((status=='Complaint Initiation' || status=='Check Complaint Completeness' || status=='Missing Information' || status=='Credit Note Acceptance' || status=='Credit Note Approval' || 
		status=='Finalize Management Decision' || status=='Finalizing Analysis' || status=='Acceptance of Analysis' || 
		status=='Credit Note Settlement' || status=='Credit Note Appeal Treatment' || status=='Analysis Appeal Treatment') && (sub_status!='Assign Complaint to Treator' 
		&& sub_status!='Assigned for Check Complaint Completeness' && sub_status!='Assigned for Credit Note Acceptance' && sub_status!='First Credit Note Acceptance In Progress' && sub_status!='Assigned for Second Credit Note Acceptance' 
		&& sub_status!='Second Credit Note Acceptance In Progress' && sub_status!='Assigned for Credit Note Appeal Treatment'
		&& sub_status!='Credit Note Appeal Treatment In Progress' && sub_status!='Assigned for Management Decision' && sub_status!='Finalize Management Decision In Progress' 
		&& sub_status!='Check Credit Note Amount In Progress' && sub_status!='Assigned for Finalizing analysis' 
		&& sub_status!='Assign Complaint to Credit Admin' && sub_status!='Assigned for Credit Note Approval' 
		&& sub_status!='Credit Note Approval In Progress' && sub_status!='Assigned for Finalizing analysis' 
		&& sub_status!='Finalizing Analysis In Progress' && sub_status!='Assigned for Acceptance of Analysis' 
		&& sub_status!='Acceptance of Analysis In Progress' && sub_status!='Assigned for Analysis Appeal Treatment' 
		&& sub_status!='Analysis Appeal Treatment In Progress' && sub_status!='Assign Complaint to Pursor'
		&& sub_status!='Assigned for Credit Note Settlement' && sub_status!='Credit Note Settlement In Progress'
		&& sub_status!='Assigned for Final Complaint Acceptance' && sub_status!='Final Complaint Acceptance In Progress'
		&& sub_status!='Closed') && (assigned_user!='' && assigned_user!=null 
		&& assigned_user!=undefined)){
			$('.save_and_complete').removeClass("hidden");
		} else if(status=='Complaint Analysis'){
			if(action=='Yes' && action!='No'){
				relatedCollection = app.data.createRelatedCollection(this.model, 'com_complaints_act_actions_1');
				relatedCollection.fetch({
				relate: true,
				success: _.bind(function (data) {
					if(data.length>0){
						$('.save_and_complete').removeClass("hidden");
					} else{
						$('.save_and_complete').addClass("hidden");
					}			
				}, this),
				error: _.bind(function () {

				}, this),
				}, {async: false});
			} else if(action=='No' && remark_on_act!='' && action!='Yes'){
				$('.save_and_complete').removeClass("hidden");
			} else{
				$('.save_and_complete').addClass("hidden");
			}
		} else if(status=='Check Complaint Completeness' && sub_status=='Assigned for Check Complaint Completeness'){
			if(input_complete=='No' && missing_information_log!='' && input_complete!='Yes'){
				$('.save_and_complete').removeClass("hidden");
			} else if(input_complete=='Yes' && responsible_for_analysis!='' && input_complete!='No'){
				$('.save_and_complete').removeClass("hidden");
			} else{
				$('.save_and_complete').addClass("hidden");
			}
		} else{
			$('.save_and_complete').addClass("hidden");
		}
		self.visibleButton();		
	},
	
	onloadView: function(){
		var self = this;
		this.SetReadonlyForALL();

		//calling function for hide show button.
		this.visibleButton();

		/////////////////////////////////
		
		
		/* Inline Edit Disable */
				$('span.record-edit-link-wrapper[data-name="system_id_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="complaint_id_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="customer_complaint_id_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="complaint_assignment_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="unit_name_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="author_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="contact_person_unit_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="accounts_com_complaints_1_name"]').remove();
				$('span.record-edit-link-wrapper[data-name="oem_ac_iso_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="type_of_oem_identification_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="subtype_of_oem_identificatio_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="industry_of_oem_identificati_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="contact_person_at_oem_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="accounts_com_complaints_2_name"]').remove();
				$('span.record-edit-link-wrapper[data-name="assigned_user_name"]').remove();
				$('span.record-edit-link-wrapper[data-name="closure_date_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="complaint_status_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="sub_status_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="accounts_com_complaints_3_name"]').remove();
				$('span.record-edit-link-wrapper[data-name="complaint_age_bucket_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="fast_action_required_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="reassigned_comments_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="product_code_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="product_code_text_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="product_type_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="prd_grp_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="prd_subgrp_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="hin_number_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="entity_of_prd_origin_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="product_responsible_pm_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="product_responsible_rnd_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="producing_unit_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="batch_no_coil_no_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="invoice_no_affiliat_compny_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="invoice_number_from_pu_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="invoice_date_pu_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="delivered_to_su_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="claimed_quantity_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="claimed_value_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="measure_unit_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="total_sqm_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="measuring_unit_length_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="length_mm_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="width_mm_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="costs_for_replacement_orders_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="industry_industry_segment_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="application_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="machine_type_machinery_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="operation_conditions_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="installation_date_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="lifetime_dropdown_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="lifetime_actual_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="expected_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="expected_lifetime_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="application_info_remarks_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="category_of_defect_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="sub_category_defect_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="level_of_defect_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="defect_code_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="possible_causes_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="defect_causes_code_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="description"]').remove();
				$('span.record-edit-link-wrapper[data-name="defect_related_info_remark_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="attachment_of_defect_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="is_there_a_sample_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="sample_description_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="purchase_order_number_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="return_purchs_order_no_desc_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="date_entered"]').remove();
				$('span.record-edit-link-wrapper[data-name="date_modified"]').remove();
				$('span.record-edit-link-wrapper[data-name="open_complaint_days_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="open_complaint_days_status_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="open_complaint_substatus_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="team_name"]').remove();
				$('span.record-edit-link-wrapper[data-name="input_complete_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="responsible_for_analysis_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="missing_information_log_t_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="incoming_date_of_sample_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="definitive_failure_code_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="definitive_sub_failure_code_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="failure_codes_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="definitive_failure_causes_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="definitive_failure_causes_co_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="responsible_for_failure_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="analysis_result_remark_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="analysis_attachment_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="analyst_comment_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="analysis_comment_t_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="define_corrective_or_prevent_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="complaint_analysis_remarks_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="further_treatment_claimed_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="comment_on_further_treatment_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="responsiblefurthertreatment_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="compensation_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="compensation_percent_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="compensation_amount_dd_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="compensation_amount_dec_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="cost_of_additionals_dd_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="cost_of_additionals_dec_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="amount_of_credit_dd_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="amount_of_credit_dec_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="final_decision_complaint_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="final_decision_on_complain_t_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="final_decision_on_analysis_l_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="finaldecisionanalysis_attach_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="final_management_decision_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="final_management_attachment_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="appeal_analysis_comments_t_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="appeal_analyiss_attachment_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="credit_note_acceptance_comme_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="credit_note_acceptance_attch_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="credit_note_appeal_info_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="creditnote_appealinfo_attach_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="management_decision_comments_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="management_decision_attach_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="analysis_acpt_cmnt_log_t_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="analysis_acpt_cmnt_log_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="analysis_acpt_cmnt_attach_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="analys_reject_cmnt_log_t_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="analys_reject_cmnt_log_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="analys_reject_cmnt_attach_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="compensationcapu_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="comppercentcapu_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="compensation_amount_dd_app_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="compensation_amount_des_app_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="cost_of_additionals_dd_app_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="cost_of_additionals_dec_app_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="amount_of_credit_dd_app_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="amount_of_credit_dec_app_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="finaldecisioncapu_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="compensationpu_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="comppercentpu_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="compensation_amount_dd_set_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="compensation_amount_dec_set_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="cost_of_additionals_dd_set_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="cost_of_additionals_dec_set_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="amount_of_credit_dd_set_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="amount_of_credit_dec_set_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="creditid_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="finalcreditcomments_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="finalcommentscomplaint_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="finalcommentfile_c"]').remove();
				$('span.record-edit-link-wrapper[data-name="billing_address_street"]').remove();
				$('span.record-edit-link-wrapper[data-name="billing_address_city"]').remove();
				$('span.record-edit-link-wrapper[data-name="billing_address_state"]').remove();
				$('span.record-edit-link-wrapper[data-name="billing_address_postalcode"]').remove();
				$('span.record-edit-link-wrapper[data-name="billing_address_country"]').remove();

		/* Inline Edit Disable - */
		
		
		
		var labelColor="";
		labelColor+="<b>Analysis Result </b>";
		labelColor+="<br><span style='color:red'><b>  &nbsp;&nbsp;(Habasit restricted - For internal use only)</b></span> : ";
		this.$('.record-label[data-name="analysis_result_remark_c"]').html(labelColor);
			
		this.HideShowSaveAndComplete();		

		setTimeout(function() {

			var open_complaint_days = self.model.get('open_complaint_substatus_c');
			if(open_complaint_days<5){
				$('span[data-fieldname="complaint_status_c"]').css({'background':'green','color':'#fff','border-radius':'30px','text-align':'center', 'display':'block', 'width':'100%', 'font-weight':'bold'});
			} else if(open_complaint_days<10){
				$('span[data-fieldname="complaint_status_c"]').css({'background':'yellow','color':'black','border-radius':'30px','text-align':'center', 'display':'block', 'width':'100%', 'font-weight':'bold'});
			} else if(open_complaint_days>10){
				$('span[data-fieldname="complaint_status_c"]').css({'background':'Red','color':'#fff','border-radius':'30px','text-align':'center', 'display':'block', 'width':'100%', 'font-weight':'bold'});
			}
			
			var userId = SUGAR.App.user.get('id');
			var UserBean = SUGAR.App.data.createBean('Users', {id:userId});
			UserBean.fetch({'success':function () {
				Is_Admin = UserBean.get('is_admin');
				if(Is_Admin==false){
					$("[name='complaint_status_c']").prop('disabled', true);
					$("[name='sub_status_c']").prop('disabled', true);

					$('div[data-original-title="Complaint Status *"]').removeClass("record-label");
					$('div[data-original-title="Complaint Status *"]').parent().removeClass("record-label-wrapper");
					$('span[data-fieldname="complaint_status_c"]').parent().removeClass('record-link-wrapper');
		
					$('div[data-original-title="Complaint Sub-Status"]').removeClass("record-label");
					$('div[data-original-title="Complaint Sub-Status"]').parent().removeClass("record-label-wrapper");
					$('span[data-fieldname="sub_status_c"]').parent().removeClass('record-link-wrapper');
				}
			},
			error:function(e){
				//No action required
			}
			});

			if($('input[name="attachment_of_defect_c"]').length > 0){
				self.showControlOnEdit();
			} else{
				self.showControlOnDetail();
			}
			
			//Datepicker fileds future date disabled
			setInterval(function(){
				$("input[name='invoice_date_pu_c'], input[name='delivered_to_su_c'], input[name='installation_date_c'], div[data-name='invoice_date_pu_c'] span.add-on[data-icon='calendar'], div[data-name='delivered_to_su_c'] span.add-on[data-icon='calendar'], div[data-name='installation_date_c'] span.add-on[data-icon='calendar'] ").click(function(){
					$(".datepicker.dropdown-menu").each(function(){
					   if($(this).is(":visible")){
						   $(this).addClass('blockFutureDate');
						   
							var dateToday = new Date();   
							var monthName = dateToday.toLocaleString("en-US", { month: "long" });
							var year = dateToday.getFullYear();
							var getMonthYear = monthName +" "+year ;
							
							var getFirstString = $('.blockFutureDate').find('.datepicker-days th.switch').text();					
							if(getMonthYear == getFirstString){
								$('.blockFutureDate').find('td.switch').next('th.next').css({'background-color':'#ddd', 'pointer-events':'none'});
							}
							var firstPrev = $('.blockFutureDate').find('.datepicker-days th.prev');
							$(firstPrev).click(function(){
								$('.blockFutureDate').find('.datepicker-days th.next').removeAttr('style');
							});
							
							
							setInterval(function(){
								$('.blockFutureDate').find('th.switch').css({'background-color':'#ddd', 'pointer-events':'none'});
								var fnextdateToday = new Date();   
								var fnextmonthName = fnextdateToday.toLocaleString("en-US", { month: "long" });
								var fnextyear = fnextdateToday.getFullYear();
								var fnextgetMonthYear = fnextmonthName +" "+fnextyear ;
								
								var fgetNextString = $('.blockFutureDate').find('.datepicker-days th.switch').text();

								if(fnextgetMonthYear == fgetNextString){
									$('.blockFutureDate').find('th.next').css({'background-color':'#ddd', 'pointer-events':'none'});
									var fdateTodaycheck = new Date();   
									var fexactDate = fdateTodaycheck.getDate() 
									//console.log(fexactDate);
									$(".blockFutureDate tbody tr td").each(function(){
										var fgetString = $(this).text();
										if(fgetString == fexactDate){
											$(this).nextAll('td').css({'background-color':'#ddd', 'pointer-events':'none'});
											 $(this).parent('tr').nextAll('tr').css({'background-color':'#ddd', 'pointer-events':'none'});
											 $(this).find('th.next').css({'background-color':'#ddd', 'pointer-events':'none'});
											 
										}
										
									});
								}else{
									$('.blockFutureDate').find('.datepicker-days th.next').removeAttr('style');
								}
							}, 100);
							
							
							
					   } else{
							$(this).removeClass('blockFutureDate');
					   }
					});
				});
			}, 100);
			
			//width and length fields same like currency
			$("div[data-name='measuring_unit_length_c']").parent(".row-fluid").css({'width':'50%','float':'left'});
			$("div[data-name='measure_unit_width_c']").parent(".row-fluid").css({'width':'50%','float':'left'});		
			$("div[data-name='total_sqm_c']").parent(".row-fluid").css({'width':'50%','float':'left'});		
			$("div[data-name='lifetime_dropdown_c']").parent(".row-fluid").css({'width':'50%','float':'left'});			
			$("div[data-name='expected_c']").parent(".row-fluid").css({'width':'50%','float':'left'});	
			
			$("div[data-name='compensation_amount_dd_c']").parent(".row-fluid").css({'width':'50%','float':'left'});		
			$("div[data-name='cost_of_additionals_dd_c']").parent(".row-fluid").css({'width':'50%','float':'left'});		
			$("div[data-name='amount_of_credit_dd_c']").parent(".row-fluid").css({'width':'50%','float':'left'});		
			
			$("div[data-name='compensation_amount_dd_app_c']").parent(".row-fluid").css({'width':'50%','float':'left'});
			$("div[data-name='cost_of_additionals_dd_app_c']").parent(".row-fluid").css({'width':'50%','float':'left'});
			$("div[data-name='amount_of_credit_dd_app_c']").parent(".row-fluid").css({'width':'50%','float':'left'});
			
			$("div[data-name='compensation_amount_dd_set_c']").parent(".row-fluid").css({'width':'50%','float':'left'});
			$("div[data-name='cost_of_additionals_dd_set_c']").parent(".row-fluid").css({'width':'50%','float':'left'});
			$("div[data-name='amount_of_credit_dd_set_c']").parent(".row-fluid").css({'width':'50%','float':'left'});
			
			$("body").append("<style type='text/css'>div[data-name='length_mm_c'] span.text-overflow, div[data-name='width_mm_c'] span.text-overflow, div[data-name='total_sqm_c'] span.text-overflow, div[data-name='lifetime_actual_c'] span.text-overflow, div[data-name='expected_lifetime_c'] span.text-overflow,  div[data-name='compensation_amount_dec_c'] span.text-overflow, div[data-name='cost_of_additionals_dec_c'] span.text-overflow, div[data-name='amount_of_credit_dec_c'] span.text-overflow  , div[data-name='compensation_amount_des_app_c'] span.text-overflow, div[data-name='cost_of_additionals_dec_app_c'] span.text-overflow, div[data-name='amount_of_credit_dec_app_c'] span.text-overflow, div[data-name='compensation_amount_dec_set_c'] span.text-overflow, div[data-name='cost_of_additionals_dec_set_c'] span.text-overflow, div[data-name='amount_of_credit_dec_set_c'] span.text-overflow   {display: none;}input[name='length_mm_c'], input[name='width_mm_c'], input[name='total_sqm_c'], input[name='lifetime_actual_c'], input[name='expected_lifetime_c'], input[name='compensation_amount_dec_c'], input[name='cost_of_additionals_dec_c'], input[name='amount_of_credit_dec_c'], input[name='compensation_amount_des_app_c'], input[name='cost_of_additionals_dec_app_c'], input[name='amount_of_credit_dec_app_c'], input[name='compensation_amount_dec_set_c'], input[name='cost_of_additionals_dec_set_c'], input[name='amount_of_credit_dec_set_c']{width: 290px !important;right: 10px;float: left;top: 14px;}span.normal.index[data-fieldname='compensationcapu_c'] a.select2-choice {width: 96% !important;}input.inherit-width[name='comppercentcapu_c'] {width: 97% !important;}.span6.record-cell.edit[data-name='comppercentcapu_c'] {position: relative;right: 10px;}.span6.record-cell.edit[data-name='compensation_percent_c'] {position: relative;right: 10px;}.span6.record-cell.edit[data-name='comppercentpu_c'] {position: relative;right: 10px;}input[name='comppercentpu_c'] {width: 97% !important;}input[name='creditid_c'] {width: 97% !important;}span.normal.index[data-fieldname='width_mm_c'] .ellipsis_inline, span.normal.index[data-fieldname='total_sqm_c'] .ellipsis_inline, span.normal.index[data-fieldname='length_mm_c'] .ellipsis_inline {  position: relative;  right: 0px;    top: 15px;}span.normal.index[data-fieldname='lifetime_actual_c'] .ellipsis_inline, .span6.record-cell[data-name='expected_lifetime_c'] .ellipsis_inline{position: relative;  right: 75px; top: 15px;}span.normal.index[data-fieldname='compensation_amount_dec_c'] .ellipsis_inline, span.normal.index[data-fieldname='cost_of_additionals_dec_c'] .ellipsis_inline, span.normal.index[data-fieldname='amount_of_credit_dec_c'] .ellipsis_inline, span.normal.index[data-fieldname='compensation_amount_dec_set_c'] .ellipsis_inline, span.normal.index[data-fieldname='cost_of_additionals_dec_set_c'] .ellipsis_inline, span.normal.index[data-fieldname='amount_of_credit_dec_set_c'] .ellipsis_inline, span.normal.index[data-fieldname='compensation_amount_des_app_c'] .ellipsis_inline, span.normal.index[data-fieldname='cost_of_additionals_dec_app_c'] .ellipsis_inline, span.normal.index[data-fieldname='amount_of_credit_dec_app_c'] .ellipsis_inline{position: relative;right: 0px;top: 14px;}.hidden{display:none !important;}.span6.record-cell.edit[data-name='author_c'] {display: inline !important;visibility: visible !important;}</style>");			
			
			$('.span6.record-cell[data-name="measure_unit_c"], .span6.record-cell[data-name="lifetime_dropdown_c"],  .span6.record-cell[data-name="expected_c"], .span6.record-cell[data-name="measure_unit_width_c"], .span6.record-cell[data-name="measuring_unit_length_c"], .span6.record-cell[data-name="compensation_amount_dd_c"],.span6.record-cell[data-name="cost_of_additionals_dd_c"], .span6.record-cell[data-name="amount_of_credit_dd_c"], .span6.record-cell[data-name="compensation_amount_dd_app_c"], .span6.record-cell[data-name="cost_of_additionals_dd_app_c"], .span6.record-cell[data-name="amount_of_credit_dd_app_c"], .span6.record-cell[data-name="compensation_amount_dd_set_c"], .span6.record-cell[data-name="cost_of_additionals_dd_set_c"], .span6.record-cell[data-name="amount_of_credit_dd_set_c"]').css('width','130px');
			
			$('.span6.record-cell[data-name="measure_unit_width_c"], .span6.record-cell[data-name="costs_for_replacement_orders_c"], .span6.record-cell[data-name="expected_c"]').parent('.row-fluid').css({'position':'relative', 'left':'10px'});
			
			setInterval(function(){
				//Hyperlink on Complaints record view to be removed for Product Master
				$('div[data-name="product_code_c"] .relate-field-container a').attr('href','#').css({'color':'black', 'pointer-events':'none'});
			}, 2000);
			
		},1000);	

		setInterval(function(){
			// fields color and feilds alignment 
			$(".select2-container a.select2-choice").css({'background-color':'#fff', 'padding':'0', 'color':'#000'});
			$(".select2-container a.select2-choice select2-chosen").css('color','#000');
			$(".select2-container").css('opacity','1');	
		}, 2000);
	 // this.ReadOnlyTab();
	},
	
	
	show_waiting: function() {
		app.alert.show('message-id', {
			level: 'process',
			title: 'In Process...' //change title to modify display from 'Loading...'
		});
	},

	dismiss_alert: function() {
		app.alert.dismiss('message-id');
	},
	
	showControlOnEdit: function() {
		
		var image_show_div = $('span[data-fieldname="attachment_of_defect_c"]').parent();
		$(image_show_div).find("span.fileName").remove();
		
		var image_show_div1 = $('span[data-fieldname="analysis_attachment_c"]').parent();
		$(image_show_div1).find("span.fileName").remove();
				
		var image_show_div3 = $('span[data-fieldname="finaldecisionanalysis_attach_c"]').parent();
		$(image_show_div3).find("span.fileName").remove();

		var image_show_div4 = $('span[data-fieldname="final_credit_note_attachment_c"]').parent();
		$(image_show_div4).find("span.fileName").remove();

		var image_show_div5 = $('span[data-fieldname="final_management_attachment_c"]').parent();
		$(image_show_div5).find("span.fileName").remove();

		var image_show_div6 = $('span[data-fieldname="appeal_analyiss_attachment_c"]').parent();
		$(image_show_div6).find("span.fileName").remove();
		
		var image_show_div7 = $('span[data-fieldname="finalcommentfile_c"]').parent();
		$(image_show_div7).find("span.fileName").remove();

		var image_show_div8 = $('span[data-fieldname="credit_note_acceptance_attch_c"]').parent();
		$(image_show_div8).find("span.fileName").remove();

		var image_show_div9 = $('span[data-fieldname="creditnote_appealinfo_attach_c"]').parent();
		$(image_show_div9).find("span.fileName").remove();

		var image_show_div10 = $('span[data-fieldname="management_decision_attach_c"]').parent();
		$(image_show_div10).find("span.fileName").remove();

		var image_show_div11 = $('span[data-fieldname="analysis_acpt_cmnt_attach_c"]').parent();
		$(image_show_div11).find("span.fileName").remove();
		
		var image_show_div12 = $('span[data-fieldname="analys_reject_cmnt_attach_c"]').parent();
		$(image_show_div12).find("span.fileName").remove();
		
		var image_show_div13 = $('span[data-fieldname="credit_note_appealcom_attach_c"]').parent();
		$(image_show_div13).find("span.fileName").remove();

		var image_show_div14 = $('span[data-fieldname="finalcommcreditnoteappattach_c"]').parent();
		$(image_show_div14).find("span.fileName").remove();



		$('span[data-fieldname="attachment_of_defect_c"]').removeAttr("hidden");
		$('span[data-fieldname="analysis_attachment_c"]').removeAttr("hidden");
		$('span[data-fieldname="finaldecisionanalysis_attach_c"]').removeAttr("hidden");
		$('span[data-fieldname="final_credit_note_attachment_c"]').removeAttr("hidden");
		$('span[data-fieldname="final_management_attachment_c"]').removeAttr("hidden");
		$('span[data-fieldname="appeal_analyiss_attachment_c"]').removeAttr("hidden");
		$('span[data-fieldname="finalcommentfile_c"]').removeAttr("hidden");
		$('span[data-fieldname="credit_note_acceptance_attch_c"]').removeAttr("hidden");
		$('span[data-fieldname="creditnote_appealinfo_attach_c"]').removeAttr("hidden");
		$('span[data-fieldname="management_decision_attach_c"]').removeAttr("hidden");
		$('span[data-fieldname="analysis_acpt_cmnt_attach_c"]').removeAttr("hidden");
		$('span[data-fieldname="analys_reject_cmnt_attach_c"]').removeAttr("hidden");
		$('span[data-fieldname="credit_note_appealcom_attach_c"]').removeAttr("hidden");
		$('span[data-fieldname="finalcommcreditnoteappattach_c"]').removeAttr("hidden");

		var curr = this;
		setTimeout(function () {
			var test_control = $('input[name="attachment_of_defect_c"]').parent();
			var image_control = "";
			image_control += '<div class="upload">';
			image_control += '<input type="button" class="uploadButton" value="Browse" />';
			image_control += '<input type="file" name="upload" multiple class="fileUpload" id="fileUpload" />';
			image_control += '<span class="dropListSection"></span>';
			image_control += '</div>';
			$(test_control).html(image_control);
			
			var test_control1 = $('input[name="analysis_attachment_c"]').parent();
			var image_control1 = "";
			image_control1 += '<div class="upload">';
			image_control1 += '<input type="button" class="uploadButton" value="Browse" />';
			image_control1 += '<input type="file" name="upload_1" multiple class="fileUpload" id="fileUpload_1" />';
			image_control1 += '<span class="dropListSection_1"></span>';
			image_control1 += '</div>';
			$(test_control1).html(image_control1);
			
			var test_control2 = $('input[name="finaldecisionanalysis_attach_c"]').parent();
			var image_control2 = "";
			image_control2 += '<div class="upload">';
			image_control2 += '<input type="button" class="uploadButton" value="Browse" />';
			image_control2 += '<input type="file" name="upload_2" multiple class="fileUpload" id="fileUpload_2" />';
			image_control2 += '<span class="dropListSection_2"></span>';
			image_control2 += '</div>';
			$(test_control2).html(image_control2);
			
			var test_control3 = $('input[name="final_credit_note_attachment_c"]').parent();
			var image_control3 = "";
			image_control3 += '<div class="upload">';
			image_control3 += '<input type="button" class="uploadButton" value="Browse" />';
			image_control3 += '<input type="file" name="upload_3" multiple class="fileUpload" id="fileUpload_3" />';
			image_control3 += '<span class="dropListSection_3"></span>';
			image_control3 += '</div>';
			$(test_control3).html(image_control3);

			var test_control4 = $('input[name="final_management_attachment_c"]').parent();
			var image_control4 = "";
			image_control4 += '<div class="upload">';
			image_control4 += '<input type="button" class="uploadButton" value="Browse" />';
			image_control4 += '<input type="file" name="upload_4" multiple class="fileUpload" id="fileUpload_4" />';
			image_control4 += '<span class="dropListSection_4"></span>';
			image_control4 += '</div>';
			$(test_control4).html(image_control4);
	
			var test_control5 = $('input[name="appeal_analyiss_attachment_c"]').parent();
			var image_control5 = "";
			image_control5 += '<div class="upload">';
			image_control5 += '<input type="button" class="uploadButton" value="Browse" />';
			image_control5 += '<input type="file" name="upload_5" multiple class="fileUpload" id="fileUpload_5" />';
			image_control5 += '<span class="dropListSection_5"></span>';
			image_control5 += '</div>';
			$(test_control5).html(image_control5);
			
			var test_control6 = $('input[name="finalcommentfile_c"]').parent();
			var image_control6 = "";
			image_control6 += '<div class="upload">';
			image_control6 += '<input type="button" class="uploadButton" value="Browse" />';
			image_control6 += '<input type="file" name="upload_6" multiple class="fileUpload" id="fileUpload_6" />';
			image_control6 += '<span class="dropListSection_6"></span>';
			image_control6 += '</div>';
			$(test_control6).html(image_control6);

			var test_control7 = $('input[name="credit_note_acceptance_attch_c"]').parent();
			var image_control7 = "";
			image_control7 += '<div class="upload">';
			image_control7 += '<input type="button" class="uploadButton" value="Browse" />';
			image_control7 += '<input type="file" name="upload_7" multiple class="fileUpload" id="fileUpload_7" />';
			image_control7 += '<span class="dropListSection_7"></span>';
			image_control7 += '</div>';
			$(test_control7).html(image_control7);
	
			var test_control8 = $('input[name="creditnote_appealinfo_attach_c"]').parent();
			var image_control8 = "";
			image_control8 += '<div class="upload">';
			image_control8 += '<input type="button" class="uploadButton" value="Browse" />';
			image_control8 += '<input type="file" name="upload_8" multiple class="fileUpload" id="fileUpload_8" />';
			image_control8 += '<span class="dropListSection_8"></span>';
			image_control8 += '</div>';
			$(test_control8).html(image_control8);

			var test_control9 = $('input[name="management_decision_attach_c"]').parent();
			var image_control9 = "";
			image_control9 += '<div class="upload">';
			image_control9 += '<input type="button" class="uploadButton" value="Browse" />';
			image_control9 += '<input type="file" name="upload_9" multiple class="fileUpload" id="fileUpload_9" />';
			image_control9 += '<span class="dropListSection_9"></span>';
			image_control9 += '</div>';
			$(test_control9).html(image_control9);

			var test_control10 = $('input[name="analysis_acpt_cmnt_attach_c"]').parent();
			var image_control10 = "";
			image_control10 += '<div class="upload">';
			image_control10 += '<input type="button" class="uploadButton" value="Browse" />';
			image_control10 += '<input type="file" name="upload_10" multiple class="fileUpload" id="fileUpload_10" />';
			image_control10 += '<span class="dropListSection_10"></span>';
			image_control10 += '</div>';
			$(test_control10).html(image_control10);

			var test_control11 = $('input[name="analys_reject_cmnt_attach_c"]').parent();
			var image_control11 = "";
			image_control11 += '<div class="upload">';
			image_control11 += '<input type="button" class="uploadButton" value="Browse" />';
			image_control11 += '<input type="file" name="upload_11" multiple class="fileUpload" id="fileUpload_11" />';
			image_control11 += '<span class="dropListSection_11"></span>';
			image_control11 += '</div>';
			$(test_control11).html(image_control11);
			
			var test_control12 = $('input[name="credit_note_appealcom_attach_c"]').parent();
			var image_control12 = "";
			image_control12 += '<div class="upload">';
			image_control12 += '<input type="button" class="uploadButton" value="Browse" />';
			image_control12 += '<input type="file" name="upload_12" multiple class="fileUpload" id="fileUpload_12" />';
			image_control12 += '<span class="dropListSection_12"></span>';
			image_control12 += '</div>';
			$(test_control12).html(image_control12);
			
			var test_control13 = $('input[name="finalcommcreditnoteappattach_c"]').parent();
			var image_control13 = "";
			image_control13 += '<div class="upload">';
			image_control13 += '<input type="button" class="uploadButton" value="Browse" />';
			image_control13 += '<input type="file" name="upload_13" multiple class="fileUpload" id="fileUpload_13" />';
			image_control13 += '<span class="dropListSection_13"></span>';
			image_control13 += '</div>';
			$(test_control13).html(image_control13);


			$(document).ready(function(){
				curr.show_waiting();
				var complaint_id = curr.model.get("id");
				$.ajax({
					url: 'index.php?entryPoint=complaints_multiple_file_upload&to_pdf=true',
					data: {'complaint_id':complaint_id,'show_delete':'yes', 'callFor': 'returnLinkedNotes'},
					type: 'post',
					dataType: 'json',
					success: function(res){
						curr.dismiss_alert();
						console.log("show files");
						$('.dropListSection').append(res[0]);
						$('.dropListSection_1').append(res[1]);
						$('.dropListSection_2').append(res[2]);
						$('.dropListSection_3').append(res[3]);
						$('.dropListSection_4').append(res[4]);
						$('.dropListSection_5').append(res[5]);
						$('.dropListSection_6').append(res[6]);
						$('.dropListSection_7').append(res[7]);
						$('.dropListSection_8').append(res[8]);
						$('.dropListSection_9').append(res[9]);
						$('.dropListSection_10').append(res[10]);
						$('.dropListSection_11').append(res[11]);
						$('.dropListSection_12').append(res[12]);
						$('.dropListSection_13').append(res[13]);
					}
				}); 
				
				function update_files_data(field_name) {
					if(field_name=="upload"){
						var file_locations = $('input[data-file_location]');
						var file_details = new Array();
						var arrIndex = 0;
						$.each(file_locations, function(key, value){
							var file_name = $(value).data('file_location');
							if(file_name.indexOf('.') > 0) {
								file_details[arrIndex] = $(value).data('file_location');
								arrIndex++;
							}
						});
						curr.model.set('images_array1_c',JSON.stringify(file_details));
					} else if(field_name=="upload_1"){
						var file_locations = $('input[data-file_location_1]');
						var file_details = new Array();
						var arrIndex = 0;
						$.each(file_locations, function(key, value){
							var file_name = $(value).data('file_location_1');
							if(file_name.indexOf('.') > 0) {
								file_details[arrIndex] = $(value).data('file_location_1');
								arrIndex++;
							}
						});
						curr.model.set('images_array2_c',JSON.stringify(file_details));
					} else if(field_name=="upload_2"){
						var file_locations = $('input[data-file_location_2]');
						var file_details = new Array();
						var arrIndex = 0;
						$.each(file_locations, function(key, value){
							var file_name = $(value).data('file_location_2');
							if(file_name.indexOf('.') > 0) {
								file_details[arrIndex] = $(value).data('file_location_2');
								arrIndex++;
							}
						});
						curr.model.set('images_array3_c',JSON.stringify(file_details));
					} else if(field_name=="upload_3"){
						var file_locations = $('input[data-file_location_3]');
						var file_details = new Array();
						var arrIndex = 0;
						$.each(file_locations, function(key, value){
							var file_name = $(value).data('file_location_3');
							if(file_name.indexOf('.') > 0) {
								file_details[arrIndex] = $(value).data('file_location_3');
								arrIndex++;
							}
						});
						curr.model.set('images_array4_c',JSON.stringify(file_details));
					} else if(field_name=="upload_4"){
						var file_locations = $('input[data-file_location_4]');
						var file_details = new Array();
						var arrIndex = 0;
						$.each(file_locations, function(key, value){
							var file_name = $(value).data('file_location_4');
							if(file_name.indexOf('.') > 0) {
								file_details[arrIndex] = $(value).data('file_location_4');
								arrIndex++;
							}
						});
						curr.model.set('images_array5_c',JSON.stringify(file_details));
					} else if(field_name=="upload_5"){
						var file_locations = $('input[data-file_location_5]');
						var file_details = new Array();
						var arrIndex = 0;
						$.each(file_locations, function(key, value){
							var file_name = $(value).data('file_location_5');
							if(file_name.indexOf('.') > 0) {
								file_details[arrIndex] = $(value).data('file_location_5');
								arrIndex++;
							}
						});
						curr.model.set('images_array6_c',JSON.stringify(file_details));
					} else if(field_name=="upload_6"){
						var file_locations = $('input[data-file_location_6]');
						var file_details = new Array();
						var arrIndex = 0;
						$.each(file_locations, function(key, value){
							var file_name = $(value).data('file_location_6');
							if(file_name.indexOf('.') > 0) {
								file_details[arrIndex] = $(value).data('file_location_6');
								arrIndex++;
							}
						});
						curr.model.set('images_array7_c',JSON.stringify(file_details));
					} else if(field_name=="upload_7"){
						var file_locations = $('input[data-file_location_7]');
						var file_details = new Array();
						var arrIndex = 0;
						$.each(file_locations, function(key, value){
							var file_name = $(value).data('file_location_7');
							if(file_name.indexOf('.') > 0) {
								file_details[arrIndex] = $(value).data('file_location_7');
								arrIndex++;
							}
						});
						curr.model.set('images_array8_c',JSON.stringify(file_details));
					} else if(field_name=="upload_8"){
						var file_locations = $('input[data-file_location_8]');
						var file_details = new Array();
						var arrIndex = 0;
						$.each(file_locations, function(key, value){
							var file_name = $(value).data('file_location_8');
							if(file_name.indexOf('.') > 0) {
								file_details[arrIndex] = $(value).data('file_location_8');
								arrIndex++;
							}
						});
						curr.model.set('images_array9_c',JSON.stringify(file_details));
					} else if(field_name=="upload_9"){
						var file_locations = $('input[data-file_location_9]');
						var file_details = new Array();
						var arrIndex = 0;
						$.each(file_locations, function(key, value){
							var file_name = $(value).data('file_location_9');
							if(file_name.indexOf('.') > 0) {
								file_details[arrIndex] = $(value).data('file_location_9');
								arrIndex++;
							}
						});
						curr.model.set('images_array10_c',JSON.stringify(file_details));
					} else if(field_name=="upload_10"){
						var file_locations = $('input[data-file_location_10]');
						var file_details = new Array();
						var arrIndex = 0;
						$.each(file_locations, function(key, value){
							var file_name = $(value).data('file_location_10');
							if(file_name.indexOf('.') > 0) {
								file_details[arrIndex] = $(value).data('file_location_10');
								arrIndex++;
							}
						});
						curr.model.set('images_array11_c',JSON.stringify(file_details));
					} else if(field_name=="upload_11"){
						var file_locations = $('input[data-file_location_11]');
						var file_details = new Array();
						var arrIndex = 0;
						$.each(file_locations, function(key, value){
							var file_name = $(value).data('file_location_11');
							if(file_name.indexOf('.') > 0) {
								file_details[arrIndex] = $(value).data('file_location_11');
								arrIndex++;
							}
						});
						curr.model.set('images_array12_c',JSON.stringify(file_details));
					} else if(field_name=="upload_12"){
						var file_locations = $('input[data-file_location_12]');
						var file_details = new Array();
						var arrIndex = 0;
						$.each(file_locations, function(key, value){
							var file_name = $(value).data('file_location_12');
							if(file_name.indexOf('.') > 0) {
								file_details[arrIndex] = $(value).data('file_location_12');
								arrIndex++;
							}
						});
						curr.model.set('images_array13_c',JSON.stringify(file_details));
					} else if(field_name=="upload_13"){
						var file_locations = $('input[data-file_location_13]');
						var file_details = new Array();
						var arrIndex = 0;
						$.each(file_locations, function(key, value){
							var file_name = $(value).data('file_location_13');
							if(file_name.indexOf('.') > 0) {
								file_details[arrIndex] = $(value).data('file_location_13');
								arrIndex++;
							}
						});
						curr.model.set('images_array14_c',JSON.stringify(file_details));
					} else{
						// No Action Required
					}
					
				}
				
				$('.fileUpload').on('click', function() {
					this.value = null;
				});
				
				$('.fileUpload').on('change', function() {
					var field_name = $(this).prop('name');
					var file_data = $(this).prop('files');
					var form_data = new FormData();
					$.each(file_data, function(key, value){
						form_data.append('file'+key, value);
					});
					form_data.append('callFrom', 'record');
					form_data.append('callFor', 'uploadFilesToTemp');
					form_data.append('field_type', field_name);
					curr.show_waiting();
					$.ajax({
						url: 'index.php?entryPoint=complaints_multiple_file_upload&to_pdf=true',
						dataType: 'text',
						cache: false,
						contentType: false,
						processData: false,
						data: form_data,                         
						type: 'post',
						success: function(res){
							if(field_name=="upload"){
								$('.dropListSection').append(res);
							} else if(field_name=="upload_1"){
								$('.dropListSection_1').append(res);
							}  else if(field_name=="upload_2"){
								$('.dropListSection_2').append(res);
							} else if(field_name=="upload_3"){
								$('.dropListSection_3').append(res);
							} else if(field_name=="upload_4"){
								$('.dropListSection_4').append(res);
							} else if(field_name=="upload_5"){
								$('.dropListSection_5').append(res);
							} else if(field_name=="upload_6"){
								$('.dropListSection_6').append(res);
							} else if(field_name=="upload_7"){
								$('.dropListSection_7').append(res);
							} else if(field_name=="upload_8"){
								$('.dropListSection_8').append(res);
							} else if(field_name=="upload_9"){
								$('.dropListSection_9').append(res);
							} else if(field_name=="upload_10"){
								$('.dropListSection_10').append(res);
							} else if(field_name=="upload_11"){
								$('.dropListSection_11').append(res);
							} else if(field_name=="upload_12"){
								$('.dropListSection_12').append(res);
							} else if(field_name=="upload_13"){
								$('.dropListSection_13').append(res);
							} else{
								// No Action Required
							}
							update_files_data(field_name);
							curr.dismiss_alert();
						}
					}); 
				});
				
				$('body').off('click').on('click', '.deleteButton', function() {
					curr.show_waiting();
					event.preventDefault();
					//delete file from UI and temporary location
					var parent_div = $(this).closest('.upload');
					var field_name = $(parent_div).find('input[type="file"]').attr('name');
					
					var button_parent = $(this).parent();
					var selected_span = $(button_parent).find("span");
					
					if(field_name=='upload'){
						var file_location = $($(selected_span).find("input")).data("file_location");
					} else if(field_name=='upload_1'){
						var file_location = $($(selected_span).find("input")).data("file_location_1");
					} else if(field_name=='upload_2'){
						var file_location = $($(selected_span).find("input")).data("file_location_2");
					} else if(field_name=='upload_3'){
						var file_location = $($(selected_span).find("input")).data("file_location_3");
					} else if(field_name=='upload_4'){
						var file_location = $($(selected_span).find("input")).data("file_location_4");
					} else if(field_name=='upload_5'){
						var file_location = $($(selected_span).find("input")).data("file_location_5");
					} else if(field_name=='upload_6'){
						var file_location = $($(selected_span).find("input")).data("file_location_6");
					} else if(field_name=='upload_7'){
						var file_location = $($(selected_span).find("input")).data("file_location_7");
					} else if(field_name=='upload_8'){
						var file_location = $($(selected_span).find("input")).data("file_location_8");
					} else if(field_name=='upload_9'){
						var file_location = $($(selected_span).find("input")).data("file_location_9");
					} else if(field_name=='upload_10'){
						var file_location = $($(selected_span).find("input")).data("file_location_10");
					} else if(field_name=='upload_11'){
						var file_location = $($(selected_span).find("input")).data("file_location_11");
					} else if(field_name=='upload_12'){
						var file_location = $($(selected_span).find("input")).data("file_location_12");
					} else if(field_name=='upload_13'){
						var file_location = $($(selected_span).find("input")).data("file_location_13");
					} else{	
						// No Action Required
					}
					
					var div_to_remove = $(this).parent();
					var button_class = $(this).attr("class");
					var actionToCall = "tempFileUpdate";
					
					$.ajax({
						url: 'index.php?entryPoint=complaints_multiple_file_upload&to_pdf=true',
						data: {'location': file_location, 'callFor': actionToCall},
						type: 'post',
						success: function(res){
							if(res == "Success") {
								$(div_to_remove).remove();
								update_files_data(field_name);
							}
							curr.dismiss_alert();
						}
					}); 
				});
			});
		}, 1000);
	},
	
	showControlOnDetail: function() {
		
		//remove inline edit
		$('div[data-original-title="Attachment of Defect"]').removeClass("record-label");
		$('div[data-original-title="Attachment of Defect"]').parent().removeClass("record-label-wrapper");
		$('span[data-fieldname="attachment_of_defect_c"]').parent().removeClass('record-link-wrapper');
		
		$('div[data-original-title="Analysis Attachments"]').removeClass("record-label");
		$('div[data-original-title="Analysis Attachments"]').parent().removeClass("record-label-wrapper");
		$('span[data-fieldname="analysis_attachment_c"]').parent().removeClass('record-link-wrapper');
		
		$('div[data-original-title="Final Decision on Analysis Attachments"]').removeClass("record-label");
		$('div[data-original-title="Final Decision on Analysis Attachments"]').parent().removeClass("record-label-wrapper");
		$('span[data-fieldname="finaldecisionanalysis_attach_c"]').parent().removeClass('record-link-wrapper');
		
		$('div[data-original-title="Final Credit Note Attachments"]').removeClass("record-label");
		$('div[data-original-title="Final Credit Note Attachments"]').parent().removeClass("record-label-wrapper");
		$('span[data-fieldname="final_credit_note_attachment_c"]').parent().removeClass('record-link-wrapper');
		
		$('div[data-original-title="Final Management Decision Document"]').removeClass("record-label");
		$('div[data-original-title="Final Management Decision Document"]').parent().removeClass("record-label-wrapper");
		$('span[data-fieldname="final_management_attachment_c"]').parent().removeClass('record-link-wrapper');
		 		
		$('div[data-original-title="Appeal Analysis Attachment"]').removeClass("record-label");
		$('div[data-original-title="Appeal Analysis Attachment"]').parent().removeClass("record-label-wrapper");
		$('span[data-fieldname="appeal_analyiss_attachment_c"]').parent().removeClass('record-link-wrapper');
		
		$('div[data-original-title=" "]').removeClass("record-label");
		$('div[data-original-title=" "]').parent().removeClass("record-label-wrapper");
		$('span[data-fieldname="finalcommentfile_c"]').parent().removeClass('record-link-wrapper');

		$('div[data-original-title="Credit Note Acceptance Comments Attachments"]').removeClass("record-label");
		$('div[data-original-title="Credit Note Acceptance Comments Attachments"]').parent().removeClass("record-label-wrapper");
		$('span[data-fieldname="credit_note_acceptance_attch_c"]').parent().removeClass('record-link-wrapper');

		$('div[data-original-title="Credit Note Appeal Information Attachments"]').removeClass("record-label");
		$('div[data-original-title="Credit Note Appeal Information Attachments"]').parent().removeClass("record-label-wrapper");
		$('span[data-fieldname="creditnote_appealinfo_attach_c"]').parent().removeClass('record-link-wrapper');
	
		$('div[data-original-title="Management Decision Comments Attachments"]').removeClass("record-label");
		$('div[data-original-title="Management Decision Comments Attachments"]').parent().removeClass("record-label-wrapper");
		$('span[data-fieldname="management_decision_attach_c"]').parent().removeClass('record-link-wrapper');

		$('div[data-original-title="Analysis Acceptance Comments Attachments"]').removeClass("record-label");
		$('div[data-original-title="Analysis Acceptance Comments Attachments"]').parent().removeClass("record-label-wrapper");
		$('span[data-fieldname="analysis_acpt_cmnt_attach_c"]').parent().removeClass('record-link-wrapper');

		$('div[data-original-title="Analysis Rejected Comments Attachments"]').removeClass("record-label");
		$('div[data-original-title="Analysis Rejected Comments Attachments"]').parent().removeClass("record-label-wrapper");
		$('span[data-fieldname="analys_reject_cmnt_attach_c"]').parent().removeClass('record-link-wrapper');

		$('span[data-fieldname="credit_note_appealcom_attach_c"]').parent().removeClass('record-link-wrapper');

		$('div[data-original-title="Final Comment on Credit Note Approval Attachment"]').removeClass("record-label");
		$('div[data-original-title="Final Comment on Credit Note Approval Attachment"]').parent().removeClass("record-label-wrapper");
		$('span[data-fieldname="finalcommcreditnoteappattach_c"]').parent().removeClass('record-link-wrapper');
		
		
		$('span[data-fieldname="attachment_of_defect_c"]').attr("hidden",true);
		$('span[data-fieldname="analysis_attachment_c"]').attr("hidden",true);
		$('span[data-fieldname="finaldecisionanalysis_attach_c"]').attr("hidden",true);
		$('span[data-fieldname="final_credit_note_attachment_c"]').attr("hidden",true);
		$('span[data-fieldname="final_management_attachment_c"]').attr("hidden",true);
		$('span[data-fieldname="appeal_analyiss_attachment_c"]').attr("hidden",true);
		$('span[data-fieldname="finalcommentfile_c"]').attr("hidden",true);
		$('span[data-fieldname="credit_note_acceptance_attch_c"]').attr("hidden",true);
		$('span[data-fieldname="creditnote_appealinfo_attach_c"]').attr("hidden",true);
		$('span[data-fieldname="management_decision_attach_c"]').attr("hidden",true);
		$('span[data-fieldname="analysis_acpt_cmnt_attach_c"]').attr("hidden",true);
		$('span[data-fieldname="analys_reject_cmnt_attach_c"]').attr("hidden",true);
		$('span[data-fieldname="credit_note_appealcom_attach_c"]').attr("hidden",true);
		$('span[data-fieldname="finalcommcreditnoteappattach_c"]').attr("hidden",true);

		var image_show_div = $('span[data-fieldname="attachment_of_defect_c"]').parent();
		var image_show_div1 = $('span[data-fieldname="analysis_attachment_c"]').parent();
		var image_show_div2 = $('span[data-fieldname="finaldecisionanalysis_attach_c"]').parent();
		var image_show_div3 = $('span[data-fieldname="final_credit_note_attachment_c"]').parent();
		var image_show_div4 = $('span[data-fieldname="final_management_attachment_c"]').parent();
		var image_show_div5 = $('span[data-fieldname="appeal_analyiss_attachment_c"]').parent();
		var image_show_div6 = $('span[data-fieldname="finalcommentfile_c"]').parent();
		var image_show_div7 = $('span[data-fieldname="credit_note_acceptance_attch_c"]').parent();
		var image_show_div8 = $('span[data-fieldname="creditnote_appealinfo_attach_c"]').parent();
		var image_show_div9 = $('span[data-fieldname="management_decision_attach_c"]').parent();
		var image_show_div10 = $('span[data-fieldname="analysis_acpt_cmnt_attach_c"]').parent();
		var image_show_div11 = $('span[data-fieldname="analys_reject_cmnt_attach_c"]').parent();
		var image_show_div12 = $('span[data-fieldname="credit_note_appealcom_attach_c"]').parent();
		var image_show_div13 = $('span[data-fieldname="finalcommcreditnoteappattach_c"]').parent();


		var complaint_id = this.model.get("id");
		//setTimeout(function(){
			$.ajax({
				url: 'index.php?entryPoint=complaints_multiple_file_upload&to_pdf=true',
				data: {'complaint_id':complaint_id, 'show_delete':'no', 'callFor': 'returnLinkedNotes'},
				type: 'post',
				dataType: 'json',
				success: function(res){
					$('span[class="fileName"]').remove();
					$(image_show_div).append(res[0]);
					$(image_show_div1).append(res[1]);
					$(image_show_div2).append(res[2]);
					$(image_show_div3).append(res[3]);
					$(image_show_div4).append(res[4]);
					$(image_show_div5).append(res[5]);
					$(image_show_div6).append(res[6]);
					$(image_show_div7).append(res[7]);
					$(image_show_div8).append(res[8]);
					$(image_show_div9).append(res[9]);
					$(image_show_div10).append(res[10]);
					$(image_show_div11).append(res[11]);
					$(image_show_div12).append(res[12]);
					$(image_show_div13).append(res[13]);
				},
			}); 
		//},1000);
	},
	
	save_complete_button:function() {
		var userId = SUGAR.App.user.get('id');
		var assign_type = this.model.get('complaint_assignment_c');
		var producing_unit = this.model.get('hcm_pu_master_id_c');
		var unit_name = this.model.get('unit_name_c');
		var complaint_status = this.model.get('complaint_status_c');
		var complaint_sub_status = this.model.get('sub_status_c');	
		var type = 'save_complete_button'
		var concatRole = '';
		var model_id = this.model.get('id');
		
		var self=this;
		var url = app.api.buildURL('Com_Complaints/SaveButtonAction/'+producing_unit+'/'+userId+'/'+assign_type+'/'+unit_name+'/'+model_id+'/comment_log/'+type);
		app.api.call('GET', url, null, {
        	success: _.bind(function (data) {
	            	if (data[0] === 'success') {
				var length = data[1].length;
				var count = 0;
				$.each(data[1], function(index, value) {
					count = count+1;
					if(count==length){
						concatRole = concatRole+"^"+value+"^";
					} else{
						concatRole = concatRole+"^"+value+"^,";
					}
				});
				self.model.set('button_action_c','save_complete_button');
				self.model.set('current_role_c',concatRole);
				self.saveClicked();
				self.dismiss_alert();
				
                	} else{
				// No Action Required
			}
            	}, this),
		error: _.bind(function(error) { 
        		app.alert.show('message-id', {
    				level: 'Error',
    				messages: 'Error',
    				autoClose: false
			});
   		}, this)
        	}, {async: false});
	},

	saveClicked: function() {
		var self=this;
		if(this.model.get('button_action_c')!="save_complete_button"){
			this.save_button_1();
		}
		this._super('saveClicked');
		this.dismiss_alert();
		setTimeout(function() {
			self.HideShowSaveAndComplete();
			//self.invisibleButton();
		},1000);
       },
		
	save_button_1:function() {
		this.showControlOnDetail();
		var userId = SUGAR.App.user.get('id');
		var assign_type = this.model.get('complaint_assignment_c');
		var producing_unit = this.model.get('hcm_pu_master_id_c');
		/*
		if(producing_unit=='' || producing_unit==null || producing_unit==undefined){
			producing_unit = $("input[name=producing_unit_c]").val();
			this.model.set('hcm_pu_master_id_c',producing_unit);
		}
		*/
		var unit_name = this.model.get('unit_name_c');
		var type = 'save_button'
		var concatRole = '';
		var model_id = this.model.get('id');
		var self=this;
		var url = app.api.buildURL('Com_Complaints/SaveButtonAction/'+producing_unit+'/'+userId+'/'+assign_type+'/'+unit_name+'/'+model_id+'/comment_log/'+type);
		app.api.call('GET', url, null, {
        	success: _.bind(function (data) {
	            	if (data[0] === 'success') {
				var length = data[1].length;
				var count = 0;
				$.each(data[1], function(index, value) {
					count = count+1;
					if(count==length){
						concatRole = concatRole+"^"+value+"^";
					} else{
						concatRole = concatRole+"^"+value+"^,";
					}
				});
				self.model.set('button_action_c','save_button');
				self.model.set('current_role_c',concatRole);
                	} else{
				// No Action Required
			}
            	}, this),
		error: _.bind(function(error) { 
        		app.alert.show('message-id', {
    				level: 'Error',
    				messages: 'Error',
    				autoClose: false
			});
   		}, this)
        	}, {async: false});
	},

	edit_button:function() {
		this.showControlOnEdit();
		this.invisibleButton();

		setTimeout(function() {
			var userId = SUGAR.App.user.get('id');
			var UserBean = SUGAR.App.data.createBean('Users', {id:userId});
			UserBean.fetch({'success':function () {
				Is_Admin = UserBean.get('is_admin');
				if(Is_Admin==false){
					$("[name='complaint_status_c']").prop('disabled', true);
					$("[name='sub_status_c']").prop('disabled', true);

					$('div[data-original-title="Complaint Status *"]').removeClass("record-label");
					$('div[data-original-title="Complaint Status *"]').parent().removeClass("record-label-wrapper");
					$('span[data-fieldname="complaint_status_c"]').parent().removeClass('record-link-wrapper');
		
					$('div[data-original-title="Complaint Sub-Status"]').removeClass("record-label");
					$('div[data-original-title="Complaint Sub-Status"]').parent().removeClass("record-label-wrapper");
					$('span[data-fieldname="sub_status_c"]').parent().removeClass('record-link-wrapper');
				}
			},
			error:function(e){
				//No action required
			}
			});
		},1000);

	},
	cancel_button:function() {
		this.showControlOnDetail();
		this.visibleButton();
	},


	daysdifference: function (firstDate) {
		var startDay = new Date(firstDate);
		var endDay = new Date();
		var millisBetween = startDay.getTime() - endDay.getTime();
		var days = millisBetween / (1000 * 3600 * 24);
		if (days > 0){
			return true;
		}else{
			return false;
		}
	},



	populateCurrencyAnalysis: function(){
        	
		console.log('in populateCurrencyAnalysis');
		var complaint_status = this.model.get('complaint_status_c');
		var compensation_amt = this.model.get('compensation_amount_dd_c');
		var cost_of_additionals = this.model.get('cost_of_additionals_dd_c');
		var compensation_amt_decimal = this.model.get('compensation_amount_dec_c');
		var cost_of_additionals_decimal = this.model.get('cost_of_additionals_dec_c');
		var amount_of_credit_dec_total = parseFloat(compensation_amt_decimal)+parseFloat(cost_of_additionals_decimal);

		if(complaint_status == 'Complaint Analysis' || complaint_status == 'Credit Note Appeal Treatment' || complaint_status == 'Finalize Management Decision'){
			if(compensation_amt == cost_of_additionals){
				this.model.set('amount_of_credit_dd_c',cost_of_additionals);
				if(!isNaN(amount_of_credit_dec_total)){
			   		this.model.set('amount_of_credit_dec_c',amount_of_credit_dec_total);
				}
				//amount_of_credit_dec = compensation_amount_dec + cost_of_additionals_dec
			}
		} 
      
    },

	populateCurrencyCreditNote: function(){
        console.log('in populateCurrencyCreditNote');
		var complaint_status = this.model.get('complaint_status_c');
		var compensation_amt_app = this.model.get('compensation_amount_dd_app_c');
		var cost_of_additionals_app = this.model.get('cost_of_additionals_dd_app_c');
		var compensation_amt_decimal_app = this.model.get('compensation_amount_des_app_c');
		var cost_of_additionals_decimal_app = this.model.get('cost_of_additionals_dec_app_c');
		var amount_of_credit_dec_app_total = parseFloat(compensation_amt_decimal_app)+parseFloat(cost_of_additionals_decimal_app);
		
		if(complaint_status == 'Credit Note Approval' ){
			if(compensation_amt_app == cost_of_additionals_app){
				this.model.set('amount_of_credit_dd_app_c',cost_of_additionals_app);
				if(!isNaN(amount_of_credit_dec_app_total)){
					this.model.set('amount_of_credit_dec_app_c',amount_of_credit_dec_app_total);
				}
			//amount_of_credit_dec = compensation_amount_dec + cost_of_additionals_dec
			}
		
		} 
      
    },

	populateCurrencySettlement: function(){
        	
		console.log('in populateCurrencySettlement');
		var complaint_status = this.model.get('complaint_status_c');
		var compensation_amt_sett = this.model.get('compensation_amount_dd_set_c');
		var cost_of_additionals_sett = this.model.get('cost_of_additionals_dd_set_c');
		var compensation_amt_decimal_sett = this.model.get('compensation_amount_dec_set_c');
		var cost_of_additionals_decimal_sett = this.model.get('cost_of_additionals_dec_set_c');
		var amount_of_credit_dec_sett_total = parseFloat(compensation_amt_decimal_sett)+parseFloat(cost_of_additionals_decimal_sett);
		
		if(complaint_status == 'Credit Note Settlement' ){
			if(compensation_amt_sett == cost_of_additionals_sett){
				this.model.set('amount_of_credit_dd_set_c',cost_of_additionals_sett);
				if(!isNaN(amount_of_credit_dec_sett_total)){
					this.model.set('amount_of_credit_dec_set_c',amount_of_credit_dec_sett_total);
				}
				//amount_of_credit_dec = compensation_amount_dec + cost_of_additionals_dec
			}
		} 
      
    },

	_doFieldValidate: function(fields, errors, callback) {
  		
		console.log('in do field validation111111111111111111');
		var complaint_status = this.model.get('complaint_status_c');
		
		var compensation_amt = this.model.get('compensation_amount_dd_c');
		var cost_of_additionals = this.model.get('cost_of_additionals_dd_c');
		var compensation_amt_decimal = this.model.get('compensation_amount_dec_c');
		var cost_of_additionals_decimal = this.model.get('cost_of_additionals_dec_c');
		var amount_of_credit_dec_total = parseFloat(compensation_amt_decimal)+parseFloat(cost_of_additionals_decimal);

		if(complaint_status == 'Complaint Analysis' || complaint_status == 'Credit Note Appeal Treatment' || complaint_status == 'Finalize Management Decision'){
			if(compensation_amt != cost_of_additionals){
				 errors['amount_of_credit_dd_c'] = errors['amount_of_credit_dd_c'] || {};
				App.alert.show('message-id', {
					level: 'error',
					messages: 'Currency of Compensation Amount and Cost of Additionals in Complaint should be same.',
					autoClose: false
				});
			}
		} 
		//Credit Note Approval
		var compensation_amt_app = this.model.get('compensation_amount_dd_app_c');
		var cost_of_additionals_app = this.model.get('cost_of_additionals_dd_app_c');
		var compensation_amt_decimal_app = this.model.get('compensation_amount_des_app_c');
		var cost_of_additionals_decimal_app = this.model.get('cost_of_additionals_dec_app_c');
		var amount_of_credit_dec_app_total = parseFloat(compensation_amt_decimal_app)+parseFloat(cost_of_additionals_decimal_app);
		
		if(complaint_status == 'Credit Note Approval' ){
			if(compensation_amt_app != cost_of_additionals_app){
				 errors['amount_of_credit_dd_app_c'] = errors['amount_of_credit_dd_app_c'] || {};
				App.alert.show('message-id', {
					level: 'error',
					messages: 'Currency of Compensation Amount and Cost of Additionals in Complaint should be same.',
					autoClose: false
				});
			}
		} 
		//Settle Credit Note
		var compensation_amt_sett = this.model.get('compensation_amount_dd_set_c');
		var cost_of_additionals_sett = this.model.get('cost_of_additionals_dd_set_c');
		var compensation_amt_decimal_sett = this.model.get('compensation_amount_dec_set_c');
		var cost_of_additionals_decimal_sett = this.model.get('cost_of_additionals_dec_set_c');
		var amount_of_credit_dec_sett_total = parseFloat(compensation_amt_decimal_sett)+parseFloat(cost_of_additionals_decimal_sett);
		
		if(complaint_status == 'Credit Note Settlement' ){
			if(compensation_amt_sett != cost_of_additionals_sett){
				 errors['amount_of_credit_dd_set_c'] = errors['amount_of_credit_dd_set_c'] || {};
				App.alert.show('message-id', {
					level: 'error',
					messages: 'Currency of Compensation Amount and Cost of Additionals in Complaint should be same.',
					autoClose: false
				});
			}
		} 
		
	var prdCode = this.model.get('product_code_c');
	var prdCodeText = this.model.get('product_code_text_c');
	if ((prdCodeText=="" || prdCodeText==undefined || prdCodeText==null) && (prdCode==undefined || prdCode=="" || prdCode==null)) {
                errors['product_code_c'] = errors['product_code_c'] || {};
                errors['product_code_c'].required = true;
		app.alert.show('message-id', {
			level: 'error',
			messages: 'Please select atleast on either Product code or Product Code Text.',
			autoClose: false
		});
    	}
	callback(null, fields, errors);
    	},
	
	copyFieldsData: function(){
        	console.log("This is the OnChange Event firing for the compalint_status field");
		
		var comp_add_cost_credit_master = this.model.get('comp_add_cost_credit_master_c');
		var c_status = this.model.get('complaint_status_c');
		var sub_status = this.model.get('sub_status_c');
		var compensation_amount_dd = this.model.get('compensation_amount_dd_c');
		var compensation_amount_dec = this.model.get('compensation_amount_dec_c');
		var cost_of_additionals_dd = this.model.get('cost_of_additionals_dd_c');
		var cost_of_additionals_dec = this.model.get('cost_of_additionals_dec_c');
		var amount_of_credit_dd = this.model.get('amount_of_credit_dd_c');
		var amount_of_credit_dec = this.model.get('amount_of_credit_dec_c');
		var compensation = this.model.get('compensation_c');
		var compensation_percent = this.model.get('compensation_percent_c');

		if((comp_add_cost_credit_master == 'Greater_Than') && (c_status == 'Credit Note Approval') && (sub_status == 'Assign Complaint to Credit Admin' || sub_status == 'Assigned for Credit Note Approval') ){
		//copy all 8 fields of compensation details to 8 fields of credit note approval
			this.model.set('compensation_amount_dd_app_c',compensation_amount_dd);
			this.model.set('compensation_amount_des_app_c',compensation_amount_dec);
			this.model.set('cost_of_additionals_dd_app_c',cost_of_additionals_dd);
			this.model.set('cost_of_additionals_dec_app_c',cost_of_additionals_dec);
			this.model.set('amount_of_credit_dd_app_c',amount_of_credit_dd);
			this.model.set('amount_of_credit_dec_app_c',amount_of_credit_dec);
			this.model.set('compensationcapu_c',compensation);
			this.model.set('comppercentcapu_c',compensation_percent);
			this.model.save();
		}
		
		if((comp_add_cost_credit_master == 'Less_Than') && (c_status == 'Credit Note Settlement') && (sub_status == 'Assign Complaint to Pursor' || sub_status == 'Assigned for Credit Note Settlement') ){
		//copy all 8 fields of compensation details to 8 fields of Settle Credit Note

			this.model.set('compensation_amount_dd_set_c',compensation_amount_dd);
			this.model.set('compensation_amount_dec_set_c',compensation_amount_dec);
			this.model.set('cost_of_additionals_dd_set_c',cost_of_additionals_dd);
			this.model.set('cost_of_additionals_dec_set_c',cost_of_additionals_dec);
			this.model.set('amount_of_credit_dd_set_c',amount_of_credit_dd);
			this.model.set('amount_of_credit_dec_set_c',amount_of_credit_dec);
			this.model.set('compensationpu_c',compensation);
			this.model.set('comppercentpu_c',compensation_percent);
			this.model.save();
		}
		
	
		var compensation_amount_dd_app = this.model.get('compensation_amount_dd_app_c');
		var compensation_amount_des_app = this.model.get('compensation_amount_des_app_c');
		var cost_of_additionals_dd_app = this.model.get('cost_of_additionals_dd_app_c');
		var cost_of_additionals_dec_app = this.model.get('cost_of_additionals_dec_app_c');
		var amount_of_credit_dd_app = this.model.get('amount_of_credit_dd_app_c');
		var amount_of_credit_dec_app = this.model.get('amount_of_credit_dec_app_c');
		var compensation_app = this.model.get('compensationcapu_c');
		var compensation_percent_app = this.model.get('comppercentcapu_c');
		
		if((comp_add_cost_credit_master == 'Greater_Than') && (c_status == 'Credit Note Settlement') && (sub_status == 'Assign Complaint to Pursor' || sub_status == 'Assigned for Credit Note Settlement') ){
			//copy all 8 fields of credit note approval to 8 fields of Settle Credit Note
			this.model.set('compensation_amount_dd_set_c',compensation_amount_dd_app);
			this.model.set('compensation_amount_dec_set_c',compensation_amount_des_app);
			this.model.set('cost_of_additionals_dd_set_c',cost_of_additionals_dd_app);
			this.model.set('cost_of_additionals_dec_set_c',cost_of_additionals_dec_app);
			this.model.set('amount_of_credit_dd_set_c',amount_of_credit_dd_app);
			this.model.set('amount_of_credit_dec_set_c',amount_of_credit_dec_app);
			this.model.set('compensationpu_c',compensation_app);
			this.model.set('comppercentpu_c',compensation_percent_app);
			this.model.save();
		}
      
    },

	
		
	//Wrote a code for button hide 
	invisibleButton: function() {

		/*$('[name="accept_credit_note_button"]').addClass('display','none');
		$('[name="reject_credit_note_button"]').css('display','none');
		$('[name="complete_credit_note_appeal_button"]').css('display','none');
		$('[name="management_decision_button"]').css('display','none');
		$('[name="complete_management_decision_button"]').css('display','none');
		$('[name="finalize_analysis_button"]').css('display','none');
		$('[name="accept_analysis_button"]').css('display','none');
		$('[name="reject_analysis_button"]').css('display','none');
		$('[name="complete_analysis_appeal_button"]').css('display','none');
		$('[name="finalize_credit_note_button"]').css('display','none');
		$('[name="close_button"]').css('display','none');*/
		
		
		$('[name="accept_credit_note_button"]').addClass('hidden');
		$('[name="reject_credit_note_button"]').addClass('hidden');
		$('[name="complete_credit_note_appeal_button"]').addClass('hidden');
		$('[name="management_decision_button"]').addClass('hidden');
		$('[name="complete_management_decision_button"]').addClass('hidden');
		$('[name="finalize_analysis_button"]').addClass('hidden');
		$('[name="accept_analysis_button"]').addClass('hidden');
		$('[name="reject_analysis_button"]').addClass('hidden');
		$('[name="complete_analysis_appeal_button"]').addClass('hidden');
		$('[name="finalize_credit_note_button"]').addClass('hidden');
		$('[name="close_button"]').addClass('hidden');
		
		
	},
	
	//Wrote a code for button show 
	visibleButton: function() {
		var self = this;
		setTimeout(function() {
			var userID = SUGAR.App.user.get('id');
			
			var complaintStatus = self.model.get('complaint_status_c');
			var comp_status = complaintStatus.replace(/\s{2,}/g, ' ');
			var complaintsubStatus = self.model.get('sub_status_c');
			var sub_status = complaintsubStatus.replace(/\s{2,}/g, ' ');
			
			var assignedToUserID = self.model.get('assigned_user_id');
			
			console.log("comp_status", comp_status);
			console.log("sub_status", sub_status);
			console.log("assigned_userID"+ assignedToUserID);
			console.log("userID"+ userID);
			
			var analysisAppeals = 0;
			var records_model_id = self.model.get('id');
			console.log("records_model_id:-"+ records_model_id);
			var comComplaintBean = app.data.createBean('Com_Complaints',{id: records_model_id});
				comComplaintBean.fetch({
				success: function (data) {
					analysisAppeals = comComplaintBean.get('number_of_analysis_appeals_c');
					if(userID==assignedToUserID && comp_status=="Credit Note Acceptance" && (sub_status=="Assigned for Credit Note Acceptance" || sub_status=="First Credit Note Acceptance In Progress" || sub_status=="Assigned for Second Credit Note Acceptance" || sub_status== "Second Credit Note Acceptance In Progress")){
						$('[name="accept_credit_note_button"]').removeClass("hidden");
					}
					if(userID==assignedToUserID && comp_status=="Credit Note Approval" && (sub_status=="Assigned for Credit Note Approval" || sub_status=="Credit Note Approval In Progress")){
						$('[name="accept_credit_note_button"]').removeClass("hidden");
					}
					if(userID==assignedToUserID && comp_status=="Credit Note Acceptance" && (sub_status=="Assigned for Credit Note Acceptance" || sub_status=="First Credit Note Acceptance In Progress")){
						$('[name="reject_credit_note_button"]').removeClass("hidden");
					}
					if(userID==assignedToUserID && (comp_status=="Analysis Appeal Treatment" || comp_status=="Credit Note Appeal Treatment") && (sub_status=="Assigned for Credit Note Appeal Treatment" || sub_status=="Credit Note Appeal Treatment In Progress")){
						$('[name="complete_credit_note_appeal_button"]').removeClass("hidden");
					}
					if(userID==assignedToUserID && comp_status=="Credit Note Acceptance" && (sub_status=="Assigned for Second Credit Note Acceptance" || sub_status=="Second Credit Note Acceptance In Progress")){
						$('[name="management_decision_button"]').removeClass("hidden");
					}
					if(userID==assignedToUserID && comp_status=="Finalize Management Decision" && (sub_status=="Assigned for Management Decision" || sub_status=="Finalize Management Decision In Progress")){
						$('[name="complete_management_decision_button"]').removeClass("hidden");
					}
					if(userID==assignedToUserID && comp_status=="Finalizing Analysis" && (sub_status=="Assigned for Finalizing analysis" || sub_status=="Finalizing Analysis In Progress")){
						$('[name="finalize_analysis_button"]').removeClass("hidden");
					}
					if(userID==assignedToUserID && comp_status=="Acceptance of Analysis" && (sub_status=="Assigned for Acceptance of Analysis" || sub_status=="Acceptance of Analysis In Progress")){
						$('[name="accept_analysis_button"]').removeClass("hidden");
					}
					if(userID==assignedToUserID && analysisAppeals!="1" && comp_status=="Acceptance of Analysis" && (sub_status=="Assigned for Acceptance of Analysis" || sub_status=="Acceptance of Analysis In Progress")){
						$('[name="reject_analysis_button"]').removeClass("hidden");
					}
					if(userID==assignedToUserID && comp_status=="Analysis Appeal Treatment" && (sub_status=="Assigned for Analysis Appeal Treatment" || sub_status=="Analysis Appeal Treatment In Progress")){
						$('[name="complete_analysis_appeal_button"]').removeClass("hidden");
					}
					if(userID==assignedToUserID && comp_status=="Credit Note Settlement" && (sub_status=="Assigned for Credit Note Settlement" || sub_status=="Credit Note Settlement In Progress")){
						$('[name="finalize_credit_note_button"]').removeClass("hidden");
					}
					if(userID==assignedToUserID && comp_status=="Final Complaint Acceptance" && (sub_status=="Assigned for Final Complaint Acceptance" || sub_status=="Final Complaint Acceptance In Progress")){
						$('[name="close_button"]').removeClass("hidden");
					}

				},
				error: function(error) {
					console.log(error);
				}
			});
		},1000);
	},
	
	//send email
	send_purchase_order_email:function() {
		var userId = SUGAR.App.user.get('id');		
		var type = 'com_complaints';
		var assign_type="";
		if(type=="com_complaints"){
			var assign_type = this.model.get('complaint_assignment_c');
		}
		var model_id = this.model.get('id');
		
		var self=this;
		var url = app.api.buildURL('Com_Complaints/SendEmail/'+userId+'/'+assign_type+'/'+model_id+'/'+type);
		app.api.call('GET', url, null, {
        	success: _.bind(function (data) {
				//console.log("response:-", data);
				if (data==='success') {
					app.alert.show('message-id', {
						level: 'success',
						messages: 'Mail send successfully',
						autoClose: false
					});
				}else{
				    app.alert.show('message-id', {
						level: 'Error',
						messages: 'Email does not send successfully.',
						autoClose: false
					});
				}
			}, this),
			error: _.bind(function(error) { 
					app.alert.show('message-id', {
						level: 'Error',
						messages: 'Error',
						autoClose: false
					});
			}, this)
		});
	},
	
	// Ambit
	accept_credit_note_button:function(model) {
	var userId = SUGAR.App.user.get('id');
	app.drawer.open({
           layout: 'accept_credit_note',
           context: {
           record_id : model.id,
           user_id :  userId,
	   module_name : "Com_Complaints"
           },
        },
        function() {
            
        });

    },
	close_button:function(model) {
	var userId = SUGAR.App.user.get('id');
	app.drawer.open({
           layout: 'close',
           context: {
           record_id : model.id,
           user_id :  userId,
	   module_name : "Com_Complaints"
           },
        },
        function() {
            
        });

    },
	reject_credit_note_button:function(model) {
	var userId = SUGAR.App.user.get('id');
	app.drawer.open({
           layout: 'reject_credit_note',
           context: {
           record_id : model.id,
           user_id :  userId,
	   module_name : "Com_Complaints"
           },
        },
        function() {
            
        });

    },
	management_decision_button:function(model) {
	var userId = SUGAR.App.user.get('id');
	app.drawer.open({
           layout: 'management_decision',
           context: {
           record_id : model.id,
           user_id :  userId,
	   module_name : "Com_Complaints"
           },
        },
        function() {
            
        });

    },
	accept_analysis_button:function(model) {
	var userId = SUGAR.App.user.get('id');
	app.drawer.open({
           layout: 'accept_analysis',
           context: {
           record_id : model.id,
           user_id :  userId,
	   module_name : "Com_Complaints"
           },
        },
        function() {
            
        });

    },
	reject_analysis_button:function(model) {
	var userId = SUGAR.App.user.get('id');
	app.drawer.open({
           layout: 'reject_analysis',
           context: {
           record_id : model.id,
           user_id :  userId,
	   module_name : "Com_Complaints"
           },
        },
        function() {
            
        });

    },
	finalize_analysis_button:function(model) {
	var userId = SUGAR.App.user.get('id');
	app.drawer.open({
           layout: 'finalize_analysis',
           context: {
           record_id : model.id,
           user_id :  userId,
	   module_name : "Com_Complaints"
           },
        },
        function() {
            
        });

    },
	complete_analysis_appeal_button:function(model) {
	var userId = SUGAR.App.user.get('id');
	app.drawer.open({
           layout: 'complete_analysis_appeal',
           context: {
           record_id : model.id,
           user_id :  userId,
	   module_name : "Com_Complaints"
           },
        },
        function() {
            
        });

    },
	complete_credit_note_appeal_button:function(model) {
	var userId = SUGAR.App.user.get('id');
	app.drawer.open({
           layout: 'complete_credit_note_appeal',
           context: {
           record_id : model.id,
           user_id :  userId,
	   module_name : "Com_Complaints"
           },
        },
        function() {
            
        });

    },
	complete_management_decision_button:function(model) {
	var userId = SUGAR.App.user.get('id');
	app.drawer.open({
           layout: 'complete_management_decision',
           context: {
           record_id : model.id,
           user_id :  userId,
	   module_name : "Com_Complaints"
           },
        },
        function() {
            
        });

    },
	finalize_credit_note_button:function(model) {
	var userId = SUGAR.App.user.get('id');
	app.drawer.open({
           layout: 'finalize_credit_note',
           context: {
           record_id : model.id,
           user_id :  userId,
	   module_name : "Com_Complaints"
           },
        },
        function() {
            
        });

    },
	
	
    SetOEMFields: function() {
		var self = this;
		var oem_identification = self.model.get('accounts_com_complaints_1accounts_ida');
		var AccountsBean = SUGAR.App.data.createBean('Accounts', {id:oem_identification}); 
		AccountsBean.fetch({'success':function () {
			AC_Iso = AccountsBean.get('ac_iso_c');
			Account_Type = AccountsBean.get('account_type');
			Account_SubType = AccountsBean.get('subtype_c');
			Industry = AccountsBean.get('industry_c');
			self.model.set("oem_ac_iso_c",AC_Iso);
			self.model.set("type_of_oem_identification_c",Account_Type);
			self.model.set("subtype_of_oem_identificatio_c",Account_SubType);
			self.model.set("industry_of_oem_identificati_c",Industry);
			
			if(oem_identification!=''){
				$("[name='oem_ac_iso_c']").prop('readonly', true);
				$("[name='subtype_of_oem_identificatio_c']").prop('readonly', true);
				$("[name='type_of_oem_identification_c']").prop('readonly', true);
				$("[name='industry_of_oem_identificati_c']").prop('readonly', true);
			} else{
				$("[name='oem_ac_iso_c']").prop('readonly', false);
				$("[name='subtype_of_oem_identificatio_c']").prop('readonly', false);
				$("[name='type_of_oem_identification_c']").prop('readonly', false);
				$("[name='industry_of_oem_identificati_c']").prop('readonly', false);
			}
		},
		error:function(e){
				//No action required
		}
		});
     	},

	SetEndUserFields: function() {
		var self = this;
		var end_user_identification = self.model.get('accounts_com_complaints_2accounts_ida');
		var AccountsBean = SUGAR.App.data.createBean('Accounts', {id:end_user_identification}); 
		AccountsBean.fetch({'success':function () {
			AC_Iso = AccountsBean.get('ac_iso_c');
			Account_Type = AccountsBean.get('account_type');
			Account_SubType = AccountsBean.get('subtype_c');
			Industry = AccountsBean.get('industry_c');
			self.model.set("end_user_ac_iso_c",AC_Iso);
			self.model.set("type_of_end_user_identificat_c",Account_Type);
			self.model.set("subtype_of_end_user_identifi_c",Account_SubType);
			self.model.set("industry_of_end_user_identif_c",Industry);

			if(end_user_identification!=''){
				$("[name='end_user_ac_iso_c']").prop('readonly', true);
				$("[name='subtype_of_end_user_identifi_c']").prop('readonly', true);
				$("[name='type_of_end_user_identificat_c']").prop('readonly', true);
				$("[name='industry_of_end_user_identif_c']").prop('readonly', true);
			} else{	
				$("[name='end_user_ac_iso_c']").prop('readonly', false);
				$("[name='subtype_of_end_user_identifi_c']").prop('readonly', false);
				$("[name='type_of_end_user_identificat_c']").prop('readonly', false);
				$("[name='industry_of_end_user_identif_c']").prop('readonly', false);
			}
		},
		error:function(e){
				//No action required
		}
		});
     	},	
});