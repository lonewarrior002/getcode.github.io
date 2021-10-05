<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class NotificationController extends MY_Controller {
	protected $title;
	
	function __construct() {
		parent::__construct();
		
		if (!$this->ion_auth->is_admin()) {
			redirect('admin/login');
		}
		$this->title = 'Notifications';
        $this->login_user_id = $this->session->userdata()['admin']['user_id'];
        $this->table_name = 'notification';
        $this->service_provider_grp  = $this->config->item('roles', 'ion_auth')['service_provider'];
        $this->customer_grp   = $this->config->item('roles', 'ion_auth')['customer'];
	}

	public function index() {

		$data['title'] = $this->title;

		// $this->renderAdmin('coming_soon', $data);

		$this->load->library('Datatables');

		$notification = new Datatables;

		$notification->select('n.id, n.sent_to, n.title, n.created_at,n.description, u.full_name', false)->from($this->table_name.' n')

                ->join('users u', 'n.sent_to = u.id')
				
				->where('title != "New Message"');

        $notification 

        	->style(['class' => 'table table-striped table-bordered nowrap'])

			->column('#', 'id')

            ->column('User Name', 'full_name')

			->column('Title', 'title')

			->column('Description', 'description')

            ->column('Sent On', 'created_at' ,function ($created_at) {

                return __date($created_at);

            });

        $notification->searchable('u.full_name, n.title');

        $notification->set_options(["columnDefs" => "[ { targets: [4], sortable: false}]"]);

		$notification->datatable($this->table_name);

		$notification->init();

		$data['datatable'] = true;

		$data['add_url'] = base_url('admin/notification/send');

        $data['title'] = $this->title;

		$this->renderAdmin('notification/index', $data);

	}

	public function send() {

        if (isset($_POST) && !empty($_POST)) {

			if($this->notification_validation($_POST) === true) {

				$request = $this->input->post();

				$user_type=$request['user_type'];
                
                $title = SITENAME.' - '.$request['title'];

                $description = $request['description'];

				if($user_type == 'customer' || $user_type == 'service_provider'){

					$users = [];

					foreach($request['users'] as $key => $value){

						$users[$key]   = $value;

					}

					$notification = [];
					foreach($request['users'] as $key => $value) {
            			$notification[$key] = [
			                'sent_by' => 1,
			                'sent_to' => $value,
			                'title'   => $title,
			                'description' => $description,
			                'created_at' => current_date()
			            ];
			            send_push($value,'users', $title, $description,'general');
			        }
			       
			        $this->db->insert_batch('notification', $notification);

					// $data['device_token']=$this->db->select('device_token')->from('users')
					// 								->where_in('id',$users)
					// 								->where('device_token !=',null)
					// 								->where('device_token !=','')
					// 								->get()->result_array();

					
					// $token=(array_values(array_column($data['device_token'], 'device_token')));
					
					//send_bulk_push($token , 2, $title, $description, 'general');

				}
				else if($user_type == 'all'){

					$query = $this->db->query("SELECT users.id FROM users JOIN users_groups ON users.id = users_groups.user_id WHERE users_groups.group_id = 2 OR users_groups.group_id = 3")->result_array();
					// $data = array_map (function($value){
					//     				return $value['id'];
					// 				} , $query);
					$data = array_column($query,'id');
					
					$notification = [];
					foreach($data as $key => $value) {
            			$notification[$key] = [
			                'sent_by' => 1,
			                'sent_to' => $value,
			                'title'   => $title,
			                'description' => $description,
			                'created_at' => current_date()
			            ];
			            send_push($value,'users', $title, $description,'general');
			        }
			        
			        $this->db->insert_batch('notification', $notification);

					// $data['device_token']=$this->db->select('device_token')->from('users')
					// 								->where('device_token !=',null)
					// 								->where('device_token !=','')
					// 								->get()->result_array();

					// $token=(array_values(array_column($data['device_token'], 'device_token')));

					//send_bulk_push($token , 2, $title, $description, 'general');
				}

				redirect('admin/notification');
			}
			else {

				$this->session->set_flashdata('error', validation_errors());

			} 
        }

        $data['title'] = 'New '.$this->title;

        $this->renderAdmin('notification/add',$data);
    }

    public function get_dropdown_data(){

    	$user_type=$this->input->post('user_type');

    	if($user_type == 'customer'){

    		$data=$this->db->select('u.id,u.full_name,ug.group_id', false)->from('users as u')

              ->join('users_groups ug', 'u.id = ug.user_id')

              ->where('ug.group_id', $this->customer_grp)
                                                            
              ->order_by('u.id', 'desc')

              ->get()->result_array();

    	}
    	else if($user_type == 'service_provider'){

    		$data=$this->db->select('u.id,u.full_name,ug.group_id', false)->from('users as u')

              ->join('users_groups ug', 'u.id = ug.user_id')

              ->where('ug.group_id', $this->service_provider_grp)
                                                            
              ->order_by('u.id', 'desc')

              ->get()->result_array();
    	} else {

    		$data = $this->comman->get_all_record('users','full_name');

    	}

        echo json_encode($data);
    }

    function notification_validation($post_array, $id = '') {

        $post_array = [

            ['field' => 'user_type', 'label' => 'user type', 'rules' => 'trim|required'],

            ['field' => 'title', 'label' => 'title', 'rules' => 'trim|required'],

            ['field' => 'description', 'label' => 'description', 'rules' => 'trim|required']

        ];

        $this->form_validation->set_rules($post_array);

        return $this->form_validation->run();

	}
}