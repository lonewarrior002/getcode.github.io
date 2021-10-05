<style type="text/css">
    .lable{margin-left: 1%;}
</style>
<div class="row justify-content-center">
    <div class="col-lg-8">
        <div class="card">
            <div class="card-content collapse show">
                <div class="card-body card-dashboard">
                    <div class="alert popup-alert alert-dismissible d-none">
                        <button type="button" class="close" data-dismiss="alert" aria-hidden="true" style="line-height: 0.7;"></button>
                    </div>
                    <form action="" method="post" name="add_promocode" id="add_promocode" enctype="multipart/form-data" autocomplete="off">

                        <div class="row">
                            <div class="col-lg-12">
                               <div class="form-group form-inline">
                                    <fieldset style="margin-right:3%;">
                                        <div class="custom-control custom-radio">
                                            <input type="radio" class="custom-control-input promocode_for" name="promocode_for" id="default" checked="" value="customer">
                                            <label class="custom-control-label" for="default" >DEFAULT</label>
                                        </div>
                                    </fieldset>
                                    <fieldset >
                                        <div class="custom-control custom-radio">
                                            <input type="radio" class="custom-control-input promocode_for" name="promocode_for" id="special_day" value="advisor">
                                            <label class="custom-control-label" for="special_day">SPECIAL DAY</label>
                                        </div>
                                    </fieldset>
                                </div>
                            </div>
                        </div>

                        <div class="row d-none" id="customer_div">
                            <div class="col-lg-6">
                                <div class="form-group">
                                    <label for="question">Type</label>
                                    <select class=" form-control" name="type_customer" id='type_customer' required data-placeholder="Select Type" required="">
                                        <option value="">Select</option>
                                        <option value="first_time">First Time</option>
                                        <option value="birthday">Birthday</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-lg-6">
                                <div class="form-group">
                                    <label for="question">Offer Code</label>
                                    <input type="text" class="form-control" name="promocode_customer" id="promocode" placeholder="Enter Offer Code" required=""> 
                                </div>
                            </div>
                        </div>

                        <div class="row d-none" id="discount">
                            <div class="col-lg-6" id="customer_discount_type">
                                <label>Discount Type</label>
                                <select class=" form-control" name="discount_type_customer" id='discount_type_customer' required data-placeholder="Select Discount Type" required="">
                                    <option value="">Select</option>
                                    <option value="flat">Flat</option>
                                    <option value="percentage">Percentage</option>
                                </select>
                            </div>
                            <div class="col-lg-6">
                                <div class="form-group">
                                    <label for="question">Discount Value</label>
                                    <input type="text" class="form-control" name="discount_value_customer" onkeypress="return validateNumber(event);" id="discount_value" placeholder="Enter Discount Value" required="">
                                </div>
                            </div>
                        </div>

                        <div class="row d-none" id="customer">
                            <div class="col-lg-6">
                                <div class="form-group">
                                    <label for="question">Free Minute</label>
                                    <input type="text" class="form-control" name="free_minute" id="free_minute" placeholder="Enter Free Minute" required="">
                                </div>
                            </div>
                            <div class="col-lg-6">
                                <div class="form-group">
                                    <label for="question">Min Minute</label>
                                    <input type="text" class="form-control" name="min_minute" id="min_minute" readonly="" placeholder="Enter Min Minute" required="">
                                </div>
                            </div>
                        </div>

                        <div class="row d-none advisor_div">
                            <div class="col-lg-6">
                                <div class="form-group">
                                    <label for="question">Offer Code</label>
                                    <input type="text" class="form-control" name="promocode_advisor" id="promocode" placeholder="Enter Offer Code" required=""> 
                                </div>
                            </div>
                            <div class="col-lg-6">
                                <div class="form-group">
                                    <label for="answer">Select Special Day</label>
                                    <input type="date" class="form-control" required="" name="special_day_date" id="datepicker" placeholder="Select Special Day" required="">
                                </div>
                            </div>
                        </div>

                        <div class="row  d-none advisor_div">
                            <!-- <div class="col-lg-6">
                                <div class="form-group">
                                    <label for="answer">Discount Type</label>
                                    <select class=" form-control" name="discount_type_advisor" id='discount_type_advisor' required data-placeholder="Select Discount Type" required="">
                                        <option value="">Select</option>
                                        <option value="flat">Flat</option>
                                        <option value="percentage">Percentage</option>
                                    </select>
                                </div>
                            </div> -->
                            <input type="text" name="discount_type_advisor" value="percentage" hidden="">
                            <div class="col-lg-6">
                                <div class="form-group">
                                    <label for="question">Discount Value</label>
                                    <input type="text" class="form-control" name="discount_value_advisor" onkeypress="return validateNumber(event);" id="discount_value" placeholder="Enter Discount Value" required="">
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <div>
                                <button type="submit" name="submit" class="btn btn-theme waves-effect waves-light text-white" id="submit">
                                    Submit
                                </button>
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
<script type="text/javascript">
    $(document).ready(()=> {
        $('#add_promocode').parsley({ excluded: ":hidden"});
        $('#reset').click(function(){
            window.location.href='<?php echo base_url('admin/offers');?>';
        });

    });


    if($('#type_customer').val() == ""){
            $('#free_minute').blur(function(){
                var val = $('#free_minute').val();
                if(val != ''){
                    $('#min_minute').prop('readonly', false).val('');
                    $('#submit').prop('disabled', false);
                }else{$('#min_minute').attr('readonly','readonly').val('');}
            });

            $('#min_minute').blur(function(){
                var min_val = $('#min_minute').val();
                var free_val = parseFloat($('#free_minute').val());
                var required_val = parseFloat("<?php echo $this->config->item('promocode_required_min_val'); ?>");
                var total = required_val + free_val;
                    
                if(min_val != ''){
                    if(min_val >= total){
                        $('#submit').prop('disabled', false);
                    }else{
                        $('#submit').prop('disabled', true);
                        $('.popup-alert').addClass('alert-danger').removeClass('d-none').html("Min Minute value should be at least "+total);
                        $(".popup-alert").fadeTo(2000, 500).slideUp(500, function(){
                            $(".popup-alert").slideUp(500);
                        });
                    }
                }else{$('#submit').prop('disabled', false);}    
            });
        }


    $('.promocode_for').change(function(){
            var id = $(this).val();
            // console.log(id);
            if(id == "customer"){

                $('#customer').removeClass('d-none');
                $('#customer_div').removeClass('d-none');
                // $('#advisor_div').addClass('d-none');
                $('.advisor_div').addClass('d-none');
                if($('#type_customer').val() == 'birthday'){
                    $('#discount').removeClass('d-none');
                    $('#customer').addClass('d-none');
                }

            }else if(id == 'advisor'){
                $('#discount').addClass('d-none');
                $('#customer').addClass('d-none');
                $('#customer_div').addClass('d-none');
                // $('#advisor_div').removeClass('d-none');
                $('.advisor_div').removeClass('d-none');
                $('#submit').prop('disabled', false);
                $('#min_minute').val('');
            }else{
               $('#customer').addClass('d-none');
               $('#customer_div').addClass('d-none');
               $('#advisor_div').addClass('d-none');
               $('.advisor_div').addClass('d-none');
            }
        });

        $('#type_customer').change(function(){
            var val = $(this).val();
            if(val == 'first_time'){
                $('#customer').removeClass('d-none');
                $('#customer_discount_type').addClass('d-none');
                $('#discount').addClass('d-none');

                $('#free_minute').blur(function(){
                    var val = $('#free_minute').val();
                    if(val != ''){
                        $('#min_minute').prop('readonly', false).val('');
                        $('#submit').prop('disabled', false);
                    }else{$('#min_minute').attr('readonly','readonly').val('');}
                });

                $('#min_minute').blur(function(){
                    var min_val = $('#min_minute').val();
                    var free_val = parseFloat($('#free_minute').val());
                    var required_val = parseFloat("<?php echo $this->config->item('promocode_required_min_val'); ?>");
                    var total = required_val + free_val;
                        
                    if(min_val != ''){
                        if(min_val >= total){
                            $('#submit').prop('disabled', false);
                        }else{
                            $('#submit').prop('disabled', true);
                            $('.popup-alert').addClass('alert-danger').removeClass('d-none').html("Min Minute value should be at least "+total);
                            $(".popup-alert").fadeTo(2000, 500).slideUp(500, function(){
                                $(".popup-alert").slideUp(500);
                            });
                        }
                    }else{$('#submit').prop('disabled', false);}    
                });

            }else if(val == 'birthday'){
                $('#customer').addClass('d-none');
                $('#discount').removeClass('d-none');
                $('#customer_discount_type').removeClass('d-none');
                $('#submit').prop('disabled', false);
            }else{
                $('#customer_discount_type').addClass('d-none');

                $('#free_minute').blur(function(){
                    var val = $('#free_minute').val();
                    if(val != ''){
                        $('#min_minute').prop('readonly', false).val('');
                        $('#submit').prop('disabled', false);
                    }else{$('#min_minute').attr('readonly','readonly').val('');}
                });

                $('#min_minute').blur(function(){
                    var min_val = $('#min_minute').val();
                    var free_val = parseFloat($('#free_minute').val());
                    var required_val = parseFloat("<?php echo $this->config->item('promocode_required_min_val'); ?>");
                    var total = required_val + free_val;
                        
                    if(min_val != ''){
                        if(min_val >= total){
                            $('#submit').prop('disabled', false);
                        }else{
                            $('#submit').prop('disabled', true);
                            $('.popup-alert').addClass('alert-danger').removeClass('d-none').html("Min Minute value should be at least "+total);
                            $(".popup-alert").fadeTo(2000, 500).slideUp(500, function(){
                                $(".popup-alert").slideUp(500);
                            });
                        }
                    }else{$('#submit').prop('disabled', false);}    
                });
            }
        });

        var promocode_for =  $('.promocode_for').val();

        if(promocode_for == 'customer'){

            $('#customer').removeClass('d-none');
            $('#customer_div').removeClass('d-none');
            $('#advisor_div').addClass('d-none');
            $('.advisor_div').addClass('d-none');


        }else if(promocode_for == 'advisor'){

            $('#customer').addClass('d-none');
            $('#customer_div').addClass('d-none');
            $('#advisor_div').removeClass('d-none');
            $('.advisor_div').removeClass('d-none');
            $('#submit').prop('disabled', false);
            $('#min_minute').val('');
        }

        function validateNumber(event) 
        {
            var key = window.event ? event.keyCode : event.which;
            if (key == 8 || key == 37 || key == 39) {
                return true;
            }
            else if ( key < 48 || key > 57 ) {
                return false;
            }
            else return true;
        }
</script>