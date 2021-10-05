<style>
    #users_length, .dt-buttons {float: left;margin-right: 2%;}
    .export_record_div .buttons-excel .search_filter {margin-left: 5% !important;}
    .profile_update{float: left;}
    #status_filter, #order_status_filter{ margin-left: 2%;} 
    .search_filter, .clear_filter {margin-left: 1%;}

</style>
<div class="row">
    <div class="col-12">    
        <div class="p-0 pb-2 text-right">

        </div>
        <div class="card">

            <div class="filter_div d-none">
                <div class="row">
                    <div class="col-12 form-group w-100" style="display: flex; ">
                        <select name="payment_filter" id="status_filter" class="form-control" style="width: unset !important;">
                            <option value="">Filter</option>
                            <option value="approved" <?php if($filter_record == 'approved'){ echo 'selected';} ?>>Approved</option>
                            <option value="pending" <?php if($filter_record == 'pending'){ echo 'selected';} ?>>Pending</option>
                            <option value="updated_profile" <?php if($filter_record == 'updated_profile'){ echo 'selected';} ?>>Updated Profile</option>
                        </select>
                        
                        <label class="btn btn-theme text-white search_filter">Search</label>
                        <?php if($filter_record) {
                            echo '<label class="btn btn-secondary text-white clear_filter">Clear Filter</label>';
                        } ?>
                    </div>
                </div>
            </div>

            <div class="card-content collapse show table-responsive">
                <div class="card-body card-dashboard">
                    <div class="">
                        <?php echo $this->datatables->generate(); ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    var open_popup_ajax = null;
    
    $(document).ready(() => {
        $('.export_record_div').append($('.filter_div'));
        $('.filter_div').removeClass('d-none');
    })
    .on('click', '.profile_update_modal', function () {

        var user_id = $(this).data('user_id');

        var params = $(this).data('params');

        open_popup_ajax = $.ajax({

            url: BASE_URL + 'admin/s-p/profile-update-popup',

            method: 'POST',

            data: {user_id: user_id,params: params},

            beforeSend: function () {

                if (open_popup_ajax != null) {

                    open_popup_ajax.abort();

                }

            },

            success: function (res) {

                // console.log(res);

                $('.comman_modal')
                
                    .find('.modal-dialog').addClass('modal-lg').end()

                    .find('.modal-title').html('Details - #' + user_id).end()

                    .find('.modal-body').html(res).end()
                    
                   .find('.modal-footer').addClass('d-none').end()
                    // .find('.modal-footer').addClass('save_changes').end()

                                        

                    .modal('show');

            }

        });

    }).on('click', '.search_filter', ()=> {

        var status_filter = $.trim($('#status_filter').val());
        if(status_filter != '') {
            if(status_filter != ''){
            // console.log(status_filter);return false;
                location.href = BASE_URL+"admin/service-provider/"+status_filter;
            }
        }
    })
    .on('click', '.clear_filter', ()=> {
        location.href = BASE_URL+"admin/service-provider/";
    });

    function delete_advisor(e){

        var id = $(e).data('id');
        console.log(id);
        Swal.fire({

            title: "Are you sure that you want to delete this record?",

            text: "You will not be able to recover record!",

            icon: "warning",

            showCancelButton: true,

            confirmButtonColor: "#28D094",

            confirmButtonText: "Yes, delete it!",

            cancelButtonText: "No, cancel please!",


        }).then((result) => {

            if (result.value) {

                open_popup_ajax = $.ajax({

                    url: BASE_URL + 'admin/ServiceProviderController/delete_advisor',

                    method: 'POST',

                    data: {
                        id: id,
                    },

                    beforeSend: function () {

                        if (open_popup_ajax != null) {

                            open_popup_ajax.abort();

                        }

                        // $('#update_profile_new').attr('disabled',true);
                    },

                    success: function (res) {

                        res = $.parseJSON(res);
                        console.log(res);
                        if(res.status){
                            $("#users").DataTable().ajax.reload();
                            Swal.fire("Deleted!", "Your record has been deleted.", "success");
                            // if(res.promocode_status == 0)

                            // {

                            //     $('.status_'+id).html('Active');

                            //     $('.status_'+id).removeClass('badge-danger');

                            //     $('.status_'+id).addClass('badge-success');

                            //     $('.status_'+id).attr('data-status',1);

                            // }

                            // else if(res.promocode_status == 1)

                            // {

                            //     $('.status_'+id).html('Inactive');

                            //     $('.status_'+id).addClass('badge-danger');

                            //     $('.status_'+id).removeClass('badge-success');  

                            //     $('.status_'+id).attr('data-status',0);
                            // }

                        }else{
                            Swal.fire("Sorry","This Advisor session is running!", "error");
                        }

                    },

                });

            }else{
            Swal.fire("Cancelled","record status is safe", "error");
            }

        });
    }

    function change_advisor_status(e){

        // console.log('here');

        var id = $(e).data('id');
        var active = $('.status_'+id).attr('data-status');

        console.log(status);
        Swal.fire({

            title: "Are you sure that you want to change status of this record?",

            text: "",

            icon: "warning",

            showCancelButton: true,

            confirmButtonColor: "#28D094",

            confirmButtonText: "Yes, change it!",

            cancelButtonText: "No, cancel please!"

        }).then((result) => {

            if (result.value) {

                open_popup_ajax = $.ajax({

                    url: BASE_URL + 'admin/ServiceProviderController/change_advisor_status',

                    method: 'POST',

                    data: {
                        active: active,
                        id: id,
                    },

                    beforeSend: function () {

                        if (open_popup_ajax != null) {

                            open_popup_ajax.abort();

                        }

                        // $('#update_profile_new').attr('disabled',true);
                    },

                    success: function (res) {

                        res = $.parseJSON(res);
                        console.log(res);
                        if(res.status){

                            if(res.advisor_status == 0)

                            {

                                $('.status_'+id).html('Active');

                                $('.status_'+id).removeClass('badge-danger');

                                $('.status_'+id).addClass('badge-success');

                                $('.status_'+id).attr('data-status',1);

                            }

                            else if(res.advisor_status == 1)

                            {

                                $('.status_'+id).html('Inactive');

                                $('.status_'+id).addClass('badge-danger');

                                $('.status_'+id).removeClass('badge-success');  

                                $('.status_'+id).attr('data-status',0);
                            }

                        }else{
                            Swal.fire("Sorry","Advisor session is running!", "error");
                        }

                    },

                });

            }else{
                Swal.fire("Cancelled","record status is safe ", "error");
            }

        });
    }
</script>