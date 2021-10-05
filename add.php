<style type="text/css">
    .user_div{display: none;}
    .select2-container{width: 100% !important;}
    .select2-search__field{ margin-top: 0 !important;}
    .user_div .select2-container--default .select2-selection--multiple .select2-selection__choice{background-color: unset !important;border-color: #83626d!important;background-image: linear-gradient(#c6a7a2, #805f6a) !important; }
    .vertical-layout .select2-container--default .select2-results__options .select2-results__option[aria-selected=true] {
        background-image: linear-gradient(#c6a7a2, #805f6a) !important;
    }
</style>
<div class="row justify-content-center">
    <div class="col-lg-8">
        <div class="card">
            <div class="card-content collapse show">
                <div class="card-body card-dashboard">
                	<form action="" method="post" name="send_notification" enctype="multipart/form-data" autocomplete="off">
                		<div class="row">
                    		<div class="col-12">
                    			<div class="form-group">
                    				<label>User Types</label>
	                                <select class="form-control" name="user_type" id="user_type" required>
	                                	<option value="">Select</option>
	                                	<option value="customer">Customer</option>
										<option value="service_provider">Service Provider</option>
										<option value="all">All</option>
									</select>
								</div>
                            </div>
                    	</div>

                        <div class="row">
                            <div class="col-12">
                                <div class="form-group user_div">
                                    <label>User Names</label>
                                    <select class="form-control select2 col-lg-12" data-parsley-errors-container="#validation-patient-error-label" data-placeholder="Select" id='user_name' name="users[]" multiple="multiple">
                                    </select>
                                    <span id="validation-patient-error-label"></span>
                                </div>
                            </div>
                        </div>
                		
                    	<div class="row">
                    		<div class="col-12">
                    			<div class="form-group">
                    				<label>Title</label>
	                                <input type="text" name="title" class="form-control" required>
								</div>
                            </div>
                    	</div>
                    	<div class="row">
                    		<div class="col-12">
                    			<div class="form-group">
                    				<label>Description</label>
	                                <textarea class="form-control" name="description" required></textarea>
								</div>
                            </div>
                    	</div>
                    	<div class="form-group">
                            <div>
                                <button type="submit" name="submit" class="btn waves-effect waves-light text-white btn-theme">
                                    Send
                                </button>
                               <!--  <a href="<?php echo base_url('admin/notification');?>" type="reset" class="btn-secondary waves-effect m-l-5">Cancel </a> -->
                                <button type="reset" class="btn btn-secondary waves-effect m-l-5" id="reset">
                                    Cancel
                                </button>
                            </div>
                        </div>
                	</form>
                </div>
            </div>
        </div>
    </div>
</div>
<!-- <script src="<?php echo assets('js/bootstrap-filestyle.min.js');?>"></script> -->
<!-- <script src="vendor/jquery-validation/dist/jquery.validate.min.js"></script> -->
<script type="text/javascript">
	$(document).ready(function() {
    	$(".select2").select2();
    }).on('change', '#user_type', function(){
    		var user_type=$(this).val();
            if($(this).val() =='customer' || $(this).val() =='service_provider'){
                $('.user_div').show();
                document.getElementById("user_name").required = true ;
                $.ajax({
                    url : "<?php echo base_url('admin/notification/dropdown');?>",
                    method : "POST",
                    data : {user_type: user_type},
                    async : true,
                    dataType : 'json',
                    success: function(data){
                        var html = '';
                        var i;
                        for(i=0; i<data.length; i++){
                            html += '<option value='+data[i].id+'>'+data[i].full_name+'</option>';
                        }
                        $('#user_name').html(html);
 
                    }
            });
            return false;
            }
            if($(this).val() =='all' || $(this).val() ==''){
                $('.user_div').hide();
                document.getElementById("user_name").required = false ;
            } 
    	}).on('click', '#reset', function(){
            window.location.href='<?php echo base_url('admin/notification');?>';
        });
	
</script>