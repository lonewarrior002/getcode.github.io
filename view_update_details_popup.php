<style>
    input[type=checkbox].bg-info+.custom-control-label:before, input[type=radio].bg-info+.custom-control-label:before{
        background-color: #334D5C!important;
    }
</style>

<div class="row update_details">
	<div class="col-md-12 text-center">
        <div class="alert popup-alert alert-dismissible d-none">

            <button type="button" class="close" data-dismiss="alert" aria-hidden="true" style="line-height: 0.7;"></button>

        </div>
		<table class="table table-striped table-responsive" style="width: 100%;">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Action</th>
                    <th>Field Name</th>
                    <th>Old Value</th>
                    <th>New Value</th>
                    
                </tr>
            </thead>
            <tbody>
                <?php
                $html = '';
                if(!empty($profile_details)) {
                    foreach ($profile_details as $key => $value) {
                    	if($value['field_name'] == 'profile_picture'){
                            if(!empty($value['old_value']) && !is_null($value['old_value']) && file_exists($value['old_value'])) {
                                $show_old = '<img src="'.((!empty($value['old_value']) && !is_null($value['old_value'])) ? base_url().$value['old_value'] : '').'" alt="no image" class="border border-secondary" style="height: 90px; object-fit: cover;">';
                            }else{$show_old = "Image Not Available";}
                    		$show_new = '<img src="'.base_url().$value['new_value'].'" alt="no image" class="border border-secondary" style="height: 90px; object-fit: cover;">';
                    	}else{$show_old = $value['old_value'];$show_new = $value['new_value'];}
                        $html .= '<tr>
                            <th scope="row">' . ($key+1) . '</th>
                            <td>';
                            if($value['field_name'] != "nick_name"){
                                $html .= '<div class="d-inline-block custom-control custom-checkbox">
                                            <input type="checkbox" class="custom-control-input bg-info update_checkbox id_'.($key+1).' accept_'.$value['field_name'].' '.$value['field_name'].'"  name="accept[]" id="accept_'.$value['field_name'].'" data-user_id = '.$value['user_id'].' data-field_name= "'.$value['field_name'].'" data-new_value = "'.$value['new_value'].'" data-status=1 data-id="'.($key+1).'" data-record_id='.$value['id'].'>
                                            <label for="accept_'.$value['field_name'].'" class="custom-control-label">Accept</label>
                                        </div><br>
                                        <div class="d-inline-block custom-control custom-checkbox">
                                            <input type="checkbox" class="custom-control-input bg-info update_checkbox reject id_'.($key+1).' reject_'.$value['field_name'].' '.$value['field_name'].'" name="reject[]" id="reject_'.$value['field_name'].'" data-user_id = '.$value['user_id'].' data-field_name= "'.$value['field_name'].'" data-new_value = "'.$value['new_value'].'" data-status = 2 data-id="'.($key+1).'" data-record_id='.$value['id'].'>
                                            <label for="reject_'.$value['field_name'].'" class="custom-control-label">Reject</label>
                                        </div>';
                            }else{
                                $html .= '-';
                            }
                            
                        $html .= '</td>
                                    <td>' . $value['field_name'] . '</td>
                                    <td>' . $show_old . '</td>
                                    <td>' . $show_new . '</td>
                                </tr>';
                    }
                } else {
                    $html .= '<tr class="text-center"><td colspan="4">No data available</td></tr>';
                }
                echo $html;
                ?>

            </tbody>
        </table>
	</div>
</div>
<div class="row">
    <div class="col-md-12 d-none reject_1 reject_box_advisor_description form-group">
        <label>Reject reason for Advisor Description</label>
        <input type="text" class="form-control" id="reject_reason_advisor_description" name="reject_reason_advisor_description" >
    </div>
    <div class="col-md-12 d-none reject_2 reject_box_profile_picture form-group">
        <label>Reject reason for Profile Picture</label>
        <input type="text" class="form-control" id="reject_reason_profile_picture" name="reject_reason_profile_picture" >
    </div>
    <input type="text" name="description_status" hidden="" id="description_status" value="" data-record>
    <input type="text" name="profile_picture_status" hidden="" id="profile_picture_status" value="">
</div>
<div class="row">
    <div class="col-md-12">
        <button type="button" class="btn btn-secondary" data-dismiss="modal" style="float: right;">Close</button>
        <button type="button" class="btn btn-theme save_changes" id="update_profile_new" style="float: right;margin-right: 1%;">Save changes</button>
    </div>
</div>
<script type="text/javascript">
        var accept = [];
        var reject = [];
        var record_id;
        var open_popup_ajax = null;
        var accept_count ;
        var reject_count;
        // var accept_new_field;

    $(document).ready(function () {

        $("input[type='checkbox']").change(function () {
            var id = $(this).attr('data-field_name');
            if(this.checked){
                $('.reject_box_'+id).addClass('d-none');
            }
            $('.'+id).not(this).prop('checked', false);
        });

        $('.accept_advisor_description').change(function(){
            var id = $(this).attr('data-record_id');
            $('#description_status').attr('data-record',id);
            if(this.checked){
                $('#description_status').attr('data-status','accept');
                $('#reject_reason_advisor_description').val('');
            }else{
                $('#description_status').attr('data-status','');
            }
        });

        $('.reject_advisor_description').change(function(){
            var id = $(this).attr('data-record_id');
            $('#description_status').attr('data-record',id);
            if(this.checked){
                $('#description_status').attr('data-status','reject');
            }else{
                $('#description_status').attr('data-status','');
            }
        });

        $('.accept_profile_picture').change(function(){
            var id = $(this).attr('data-record_id');
            $('#profile_picture_status').attr('data-record',id);
            if(this.checked){
                $('#profile_picture_status').attr('data-status','accept');
                $('#reject_reason_profile_picture').val('');
            }else{
                $('#profile_picture_status').attr('data-status','');
            }
        });

        $('.reject_profile_picture').change(function(){
            var id = $(this).attr('data-record_id');
            $('#profile_picture_status').attr('data-record',id);
            if(this.checked){
                console.log("here");
                $('#profile_picture_status').attr('data-status','reject');
            }else{
                $('#profile_picture_status').attr('data-status','');
            }
        });

        $("input[name='reject[]']").change(function(){
            var id = $(this).attr('data-field_name');
            var record_id = $(this).attr('data-record_id');
            
            if(this.checked){
                $('.reject_box_'+id).removeClass('d-none');
            }else{
                $('.reject_box_'+id).addClass('d-none');
                $('#reject_reason_'+id).val('');
            }
        });
        
        $('#update_profile_new').click(()=>{

            // accept_count = $("input[name='accept[]']:checked").length;

            // var reason_advisor_description = $("#reject_reason_1").val();
            var reason_advisor_description = (($("#reject_reason_advisor_description").val() != '') && ($("#reject_reason_advisor_description").val() != undefined)) ? $("#reject_reason_advisor_description").val() : '';

            // var reason_profile_picture = $("#reject_reason_2").val();
            var reason_profile_picture = (($("#reject_reason_profile_picture").val() != '') && ($("#reject_reason_profile_picture").val() != undefined)) ? $("#reject_reason_profile_picture").val() : '';


            // var advisor_description_status = $('#description_status').val();
            var advisor_description_status = (($('#description_status').attr('data-status') != '') && ($('#description_status').attr('data-status') != undefined)) ? $('#description_status').attr('data-status') : '';

            // var profile_picture_status = $('#profile_picture_status').val();
            // var profile_picture_status = $('#profile_picture_status').attr('data-status');

            var profile_picture_status = (($('#profile_picture_status').attr('data-status') != '') && ($('#profile_picture_status').attr('data-status') != undefined)) ? $('#profile_picture_status').attr('data-status') : '';

            //  return false;
            // console.log(advisor_description_status);
            // console.log(profile_picture_status);
            // return false;
            if(advisor_description_status == '' && profile_picture_status == ''){

                $('.popup-alert').addClass('alert-danger').removeClass('d-none').html('please  select one of the following status');

                $(".popup-alert").fadeTo(2000, 500).slideUp(500, function(){

                    $(".popup-alert").slideUp(500);

                });

                return false;
            }
            else if((advisor_description_status == 'reject' && reason_advisor_description == '' )){

                $('.popup-alert').addClass('alert-danger').removeClass('d-none').html('please enter reject reason for advisor description');

                $(".popup-alert").fadeTo(2000, 500).slideUp(500, function(){

                    $(".popup-alert").slideUp(500);

                });

                return false;

            }else if(profile_picture_status == 'reject' && reason_profile_picture == ''){

                $('.popup-alert').addClass('alert-danger').removeClass('d-none').html('please enter reject reason for profile picture');

                $(".popup-alert").fadeTo(2000, 500).slideUp(500, function(){

                    $(".popup-alert").slideUp(500);

                });

            }
            else{

                // console.log('here123');return false;

                var advisor_description_new_value = (($(".advisor_description").attr('data-new_value') != '') && ($(".advisor_description").attr('data-new_value') != undefined)) ? $(".advisor_description").attr('data-new_value') : '';

                var profile_picture_new_value = (($(".profile_picture").attr('data-new_value') != '') && ($(".profile_picture").attr('data-new_value') != undefined)) ? $(".profile_picture").attr('data-new_value') : '';

                var user_id = (($('.update_checkbox').attr('data-user_id') != '') && ($('.update_checkbox').attr('data-user_id') != undefined)) ? $('.update_checkbox').attr('data-user_id') : '';

                var advisor_description_record_id = (($('#description_status').attr('data-record') != '') && ($('#description_status').attr('data-record') != undefined)) ? $('#description_status').attr('data-record') : '';

                var profile_picture_record_id = (($('#profile_picture_status').attr('data-record') != '') && ($('#profile_picture_status').attr('data-record') != undefined)) ? $('#profile_picture_status').attr('data-record') : '';

                // return false;


                open_popup_ajax = $.ajax({

                    url: BASE_URL + 'admin/s-p/profile-update-save',

                    method: 'POST',

                    data: {
                        advisor_description_record_id: advisor_description_record_id,
                        advisor_description_status: advisor_description_status, 
                        advisor_description_new_value: advisor_description_new_value,
                        reason_advisor_description: reason_advisor_description, 
                        profile_picture_record_id: profile_picture_record_id,
                        profile_picture_status: profile_picture_status, 
                        reason_profile_picture: reason_profile_picture,
                        profile_picture_new_value: profile_picture_new_value, 
                        user_id: user_id 
                    },

                    beforeSend: function () {

                        if (open_popup_ajax != null) {

                            open_popup_ajax.abort();

                        }

                        $('#update_profile_new').attr('disabled',true);
                    },

                    success: function (res) {
                        $('#update_profile_new').attr('disabled',false);

                        res = $.parseJSON(res);

                        $('.popup-alert').addClass('alert-success').removeClass('alert-danger d-none').html(res.message);

                        $(".popup-alert").fadeTo(2000, 500).slideUp(500, function(){

                            $(".popup-alert").slideUp(500);

                        });

                        setTimeout(function () {

                            $('.comman_modal').modal('hide');

                            
                        }, 1000);

                    },

                    complete: function (res) {

                        $('#users').DataTable().ajax.reload();
                    } 

                });

                // return false;

            }
        })

    }).on('hidden.bs.modal', '.comman_modal', function(e) {
        // console.log('modal_close');
        $('.comman_modal').find('.modal-body').html('');
    });
    
</script>

                                    