var config = require("./config")();
var functions = require("./functions");

var https = require('https');
var fs = require('fs');
express = require('express'),
        app = express();

/*var ssl_option = {
    key: fs.readFileSync('/var/www/html/ssl/private.key'),
    cert: fs.readFileSync('/var/www/html/ssl/certificate.crt'),
    ca: fs.readFileSync('/var/www/html/ssl/bundle.crt')
};
 
var server = https.createServer(ssl_option, app).listen(config.port, function () {
    console.log("Server listening on: " + config.port);
});*/

var server = require('http').Server(app); 
var io = require('socket.io')(server,{
  pingInterval: 6000,
  pingTimeout: 6000
});
var port = app.get('port');
var unix_time = require('unix-time');
var moment = require('moment');
var unirest = require('unirest');
const utf8 = require('utf8');
var FCM = require('fcm-node');
var fcm = new FCM(config.fcm_server_key);
var message_status = false;
var base_url = "http://localhost/";

const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const ChatGrant = AccessToken.ChatGrant;

// Used when generating any kind of Access Token

const VoiceGrant = AccessToken.VoiceGrant;



server.listen(config.port, function () {
   console.log("Server listening on: %s", config.port);
});

var customer_ = config.customer_prefix;
var advisor_ = config.advisor_prefix;

var customer_updated = {};
var advisor_updated = {};

var customer_last_updated = {};
var advisor_last_updated = {};

var customer = {};
var advisor = {};

var customer_list = []; 
var advisor_list = [];

app.get('/', function (req, res) {
    res.json({status: true});
});

app.get('/send_push', function (req, res) {
    voice.notify.services(twilioServiceSID)
             .notifications
             .create({body: 'Hello Bob', identity: ['ankur123']})
             .then(notification => console.log(notification.sid));
});
app.get('/token2/:name', function (req, res) {

	var name = req.params.name;
    console.log('name :-',name);
    const voice_token = new AccessToken(
        twilioAccountSid,
        twilioApiKey,
        twilioApiSecret,
        {identity: name},
        86400
    );
    //console.log('before grant',voice_token);
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twilioTwiMLSIDKey,
      incomingAllow: true, // allows your client-side device to receive calls as well as make them
      pushCredentialSid: twilioFCMPushSID
    });
    voice_token.addGrant(voiceGrant);
    //console.log('after grant',voice_token); 
	
    res.json({identity:name,token:voice_token.toJwt()});
});


io.on('connection', function (socket) {
    
    socket.on('connect_customer', function (data) {

        var vet_id = functions.validate_params(data.customer_id);

        console.log('customer_id ------ main_connection : ', data);

        if (vet_id !== false)
        {
             var socket_user_id = customer_ + vet_id;
             customer[socket_user_id] = vet_id;
             socket.username = socket_user_id;
             socket.room = socket_user_id;
             socket.join("normal_users");
             socket.join(socket_user_id);
             var timestamp = unix_time(new Date());
             customer_updated[vet_id] = timestamp;
             io.sockets.in(socket_user_id).emit('connect_customer', {message: 'Customer Connected ...'});
            if (customer_list.indexOf(vet_id) == -1)
            {
                customer_list.push(vet_id);
            }
             //customer_list.push(vet_id);
             //console.log('customer_list',customer_list);
        }

    });

    socket.on('advisor_availability', function (data) {
        var advisor_id  = functions.validate_params(data.advisor_id);
        
        // var user_data = "SELECT DISTINCT type FROM availability WHERE status = 1 AND user_id = "+advisor_id;
        // config.con.query(user_data, function (err, result_user) {

        //     var names = arrayColumn(result_user, 'type');
        //     console.log('names',names);
        //     var type = "'"+(names.join("','"))+"'";
        
        //     var sql5 = "UPDATE availability set status = 1 WHERE type IN("+type+") AND user_id = "+advisor_id;
        //     functions.update_record_mysql(sql5,config.con);
        //     console.log('sql5',sql5);

        //     io.sockets.in(advisor_+advisor_id).emit('advisor_availability', {message: "availability",availability: result_user });
        // });

        var url = "http://localhost";
	            
        unirest.post(url)
        .headers({'Content-Type': 'multipart/form-data','key': "TempleBliss123*#*"})
        .field('advisor_id', advisor_id) 
        .end(function (response) {
            console.log(response.body);
        });
    });

    socket.on('connect_advisor', function (data) {

        var advisor_id = functions.validate_params(data.advisor_id);

        console.log('advisor_id--main_connection : ', data);

        if (advisor_id !== false)
        {
            // if (advisor_list.indexOf(advisor_id) == -1)
            // {
                var socket_user_id = advisor_ + advisor_id;
                advisor[socket_user_id] = advisor_id;
                socket.username = socket_user_id;
                socket.room = socket_user_id;
                socket.join("advisors");
                socket.join(socket_user_id);
                var timestamp = unix_time(new Date());
                advisor_updated[advisor_id] = timestamp;
                // var user_data = "SELECT notify_me_customers FROM users WHERE id = "+advisor_id+"";
                // config.con.query(user_data, function (err, result_user) {
                //     if(result_user !== undefined && result_user !== null && result_user.length > 0){
                //         var customer_ids = result_user[0].notify_me_customers;
                //         if(customer_ids != '' && customer_ids != null){
                //             var res = customer_ids.split(",");
                //             res.forEach(function(entry) {
                //                 console.log('notify_me_customers',entry);
                //                 var send_push_data = {};
                //                 var booking_id = ''; 
                //                 send_push_data['user_id']           = entry;
                //                 send_push_data['advisor_id']        = advisor_id;
                //                 send_push(entry,'users','Advisor is online',"This Advisor is online now. Do you want to connect?",'general',booking_id,send_push_data);
                //             });
                //             var sql1 = "UPDATE users set notify_me_customers = null WHERE id = "+advisor_id+"";
                //             functions.update_record_mysql(sql1,config.con);
                //         }
                //     }
                // });
                io.sockets.in(socket_user_id).emit('connect_advisor', {message: 'advisor Connected ...'});
                if (advisor_list.indexOf(advisor_id) == -1)
                {
                    advisor_list.push(advisor_id);
                }
                //console.log('advisor_list',advisor_list);
           // }
        }

    });

    socket.on('connect_customer_interval', function (data) {
        var vet_id = functions.validate_params(data.customer_id);
        if (vet_id !== false)
        {
            console.log('connect_customer_interval.........................',vet_id);

            //console.log('customer_last_updated before: ',customer_last_updated[vet_id]);
            var timestamp = unix_time(new Date());
            customer_last_updated[vet_id] = timestamp;

            //console.log('customer_last_updated after: ',customer_last_updated[vet_id]);
           
            //console.log('============= Customer_list_interval :',customer_list);
             var socket_user_id = customer_ + vet_id;
             io.sockets.in(socket_user_id).emit('connect_customer_interval', {message: 'Customer Connected Interval...'});
        }
    });
    socket.on('connect_advisor_interval', function (data) {
        var vet_id = functions.validate_params(data.advisor_id);
        if (vet_id !== false)
        {
            console.log('connect_advisor_interval.........................',vet_id);

            //console.log('advisor_last_updated before: ',advisor_last_updated[vet_id]);
            var timestamp = unix_time(new Date());
            advisor_last_updated[vet_id] = timestamp;

            //console.log('advisor_last_updated after: ',advisor_last_updated[vet_id]);

            //console.log('connect_advisor_interval.........................',vet_id);
            //console.log('============= Advisor_list_interval :',advisor_list);
             var socket_user_id = advisor_ + vet_id;
            //  if (advisor_list.indexOf(vet_id) == -1)
            // {
            //     advisor_list.push(vet_id);
            // }
            io.sockets.in(socket_user_id).emit('connect_advisor_interval', {message: 'Advisor Connected Interval...'});
        }
    });

    
    // updated booking request socket
    socket.on('booking_request',function(data){
        console.log('booking_request', data);
        var user_id = functions.validate_params(data.user_id);
        var username = functions.validate_params(data.username);
        var advisor_id = functions.validate_params(data.advisor_id);
        var type = functions.validate_params(data.type);
        var minute = functions.validate_params(data.minute);
        var free_minute = functions.validate_params(data.free_minute);
        var category_id = functions.validate_params(data.category_id);
        var current_date = latest_date();
        var booking_id = 0;
        var status = '';
        var default_message = "Hello";
        var sender_token = '';
        var receiver_token = '';
        var room = '';
       
        if(user_id !== false && advisor_id !== false && type !== false && minute !== false  && free_minute !== false)
        {
            var availability_data = "SELECT price FROM availability WHERE user_id = "+advisor_id+" AND category_id = "+category_id+" AND type = '"+type+"'";
            config.con.query(availability_data, function (err, result_availability_data) {
                // console.log('booking_amount',booking_amount);
                var user_wallet_data = "SELECT wallet_amount FROM users WHERE id = "+user_id;
                config.con.query(user_wallet_data, function (err, result_user_wallet_data) {
                    var booking_minute = minute;
                    if(free_minute != '' && free_minute != 0){
                        booking_minute = minute - free_minute;
                    }

                    var booking_amount = parseFloat(result_availability_data[0].price) * booking_minute;
                    console.log('booking_amount',booking_amount);
                    if(result_user_wallet_data[0].wallet_amount >= booking_amount){

                        var user_data = "SELECT status FROM availability WHERE user_id = "+advisor_id+" AND type = '"+type+"'";
                        config.con.query(user_data, function (err, result_user) {
                        
                            var status = result_user[0].status;
                            if(status == 1) {
             
                                // var sql = "Insert into booking_request(user_id,advisor_id,category_id,type,status,start_time,minute,free_minute,created_at)values('"+user_id+"','"+advisor_id+"','"+category_id+"','"+type+"','1','"+current_date+"','"+minute+"','"+free_minute+"','"+current_date+"')";
                                // functions.insert_record_mysql_callable(sql,config.con, function(last_insert_id) {

                                var sql = "Insert into booking_request(user_id,advisor_id,category_id,type,minute,free_minute,created_at)values('"+user_id+"','"+advisor_id+"','"+category_id+"','"+type+"','"+minute+"','"+free_minute+"','"+current_date+"')";
                                functions.insert_record_mysql_callable(sql,config.con, function(last_insert_id) {

                                    booking_id = last_insert_id;

                                    if(type == "video" || type == "audio"){
                                        var booking_request_sql = 'UPDATE booking_request set status = "1",start_time = "'+current_date+'" WHERE id = '+booking_id;
                                        functions.update_record_mysql(booking_request_sql,config.con);
                                    }
                                    
                                    if(minute == 1 || minute == '1'){
                                        var message = 'Request arrived from '+username+' to '+type+' for '+minute+' minute';
                                    }else{
                                        var message = 'Request arrived from '+username+' to '+type+' for '+minute+' minutes';
                                    }
            
                                    var send_push_data = {}; 
                                    
                                    send_push_data['user_id']           = user_id;
                                    send_push_data['booking_id']        = booking_id; 
                                    send_push_data['type']              = type;
                                    send_push_data['minute']            = minute;
                                    send_push_data['booking_time']      = latest_time_only();
                                    send_push_data['start_time']        = current_date;
                                    send_push_data['message']           = message;
                                    send_push_data['default_message']   = default_message;
            
                                    // io.sockets.in(advisor_+advisor_id).emit('booking_request', {user_id: user_id, username: username,booking_id: booking_id,type: type,minute:minute,message: message});
                                    // io.sockets.in(advisor_+advisor_id).emit('booking_request_android', {user_id: user_id, username: utf8.encode(username),booking_id: booking_id,type: type,minute:minute,message: message});
            
                                    var user_data = "SELECT users.profile_picture as customer_profile_picture, advisor.profile_picture as advisor_profile_picture,advisor.nick_name as advisor_name,users.full_name as customer_name FROM users JOIN users as advisor on advisor.id = "+advisor_id+" WHERE users.id = "+user_id;
                                    config.con.query(user_data, function (err, result_user) {
                                        
                                        var user_data2 = "SELECT minute FROM booking_request WHERE id = "+booking_id;
                                        config.con.query(user_data2, function (err2, result_user2) {
            
                                            var minute = result_user2[0].minute;
                                            var advisor_profile_picture = result_user[0].advisor_profile_picture;
                                            var customer_profile_picture = result_user[0].customer_profile_picture;
                                            var advisor_name = result_user[0].advisor_name;
                                            var customer_name = result_user[0].customer_name;

                                            var customer_profile_picture_voip = (customer_profile_picture == null) ? "null" : customer_profile_picture;
                                            var advisor_profile_picture_voip = (advisor_profile_picture == null) ? "null" : advisor_profile_picture;
            
                                            send_push_data['customer_name']                = customer_name;
                                            send_push_data['advisor_name']                 = advisor_name;
                                            send_push_data['advisor_profile_picture']      = advisor_profile_picture;
                                            send_push_data['customer_profile_picture']     = customer_profile_picture;
            
                                            var advisor_availability_data = "SELECT DISTINCT type FROM availability WHERE status = 1 AND user_id = "+advisor_id;
                                            config.con.query(advisor_availability_data, function (err, result_availability_data) {
            
                                                var names = arrayColumn(result_availability_data, 'type');
                                                var type = "'"+(names.join("','"))+"'";
                                            
                                                var available_for_sql = 'UPDATE users set available_for = "'+type+'" WHERE id = '+advisor_id;
                                                functions.update_record_mysql(available_for_sql,config.con);
                                                
                                            });
            
                                            if(type == "video"){ 
            
                                                token.identity = customer_name.toString();
                                                var sender_name = customer_name.toString();
                                                const videoGrant = new VideoGrant({
                                                    incomingAllow: true, // allows your client-side device to receive calls as well as make them
                                                    pushCredentialSid: twilioFCMPushSID,
                                                    room: 'TempleBliss-'+booking_id
                                                });
                                                token.addGrant(videoGrant); 
                                                sender_token = token.toJwt();
            
                                                token.identity = advisor_name.toString();
                                                const videoGrant2 = new VideoGrant({
                                                    incomingAllow: true, // allows your client-side device to receive calls as well as make them
                                                    pushCredentialSid: twilioFCMPushSID,
                                                    room: 'TempleBliss-'+booking_id
                                                });
                                                token.addGrant(videoGrant2);
                                                receiver_token = token.toJwt();
            
                                                room = 'TempleBliss-'+booking_id;
            
                                                send_push_data['sender_token'] = sender_token;
                                                send_push_data['receiver_token'] = receiver_token;
                                                send_push_data['room'] = room;
                                                send_push_data['advisor_id'] = advisor_id;
            
                                                var url = base_url+"advisor/voip";
                                                unirest.post(url)
                                                .headers({'Content-Type': 'multipart/form-data','key': "TempleBliss123*#*"})
                                                .field('advisor_id', advisor_id) 
                                                .field('twi_call_sid', "CAb63d5b22af1f82f135fe742911548c85")
                                                .field('twi_bridge_token', room)
                                                .field('twi_account_sid', twilioAccountSid)
                                                .field('twi_from', customer_name)
                                                .field('twi_to', advisor_name)
                                                .field('user_id', user_id)
                                                .field('booking_id', booking_id)
                                                .field('receiver_token', receiver_token)
                                                .end(function (response) {
                                                    console.log('voip_video',response.body);
                                                });
                                                
                                            }else if(type == "chat"){ 
                                                
                                                

                                                var url = base_url+"advisor/voip_normal";
                                                unirest.post(url)
                                                .headers({'Content-Type': 'multipart/form-data','key': "TempleBliss123*#*"})
                                                .field('advisor_id', advisor_id)
                                                .field('user_id', user_id)
                                                .field('type', type) 
                                                .field('start_time', current_date)
                                                .field('customer_profile_picture', customer_profile_picture_voip)
                                                .field('message', 'Request accepted')
                                                .field('default_message', default_message)
                                                .field('advisor_profile_picture', advisor_profile_picture_voip)
                                                .field('booking_id', booking_id)
                                                .field('customer_name', customer_name)
                                                .field('twi_from', customer_name)
                                                .field('twi_to', advisor_name)
                                                .end(function (response) {
                                                    console.log('voip_chat',response.body);
                                                });

                                            }
                                            console.log('send_push_data',send_push_data);
                                            send_push(advisor_id,'users','New Booking',message,'booking_request1',booking_id,send_push_data,silent_type = "silent");
            
                                            if(type != "chat"){

                                                var sql5 = "UPDATE availability set status = 2 WHERE user_id = "+advisor_id;
                                                functions.update_record_mysql(sql5,config.con);

                                                io.sockets.in(customer_+user_id).emit('request_accept', {advisor_id: advisor_id,user_id: user_id,type: type,customer_profile_picture: customer_profile_picture,advisor_profile_picture: advisor_profile_picture,advisor_name: advisor_name,customer_name: customer_name,start_time: current_date,booking_id: booking_id,default_message: default_message,minute:minute,room:room,receiver_token:receiver_token,sender_token:sender_token,message: 'Request accepted'});
            
                                                io.sockets.in(advisor_+advisor_id).emit('request_accept', {user_id: user_id,advisor_id: advisor_id,type: type,customer_profile_picture: customer_profile_picture,advisor_profile_picture: advisor_profile_picture,advisor_name: advisor_name,customer_name: customer_name,start_time: current_date,booking_id: booking_id,default_message: default_message,minute:minute,receiver_token:receiver_token,sender_token:sender_token,room:room,message: 'Request accepted'});

                                                io.sockets.in("normal_users").emit("advisor_buzy", {advisor_id: advisor_id});
                                            }else{
                                                console.log('chat_booking_request');
                                                io.sockets.in(advisor_+advisor_id).emit('booking_request', {user_id: user_id, username: customer_name,booking_id: booking_id,type: type,minute:minute,message: message});
                                                // io.sockets.in(advisor_+advisor_id).emit('booking_request_android', {user_id: user_id, username: utf8.encode(username),booking_id: booking_id,type: type,minute:minute,message: message});
                                            }
            
                                        });
                                    });
                                    
                                });
                                
                                // setTimeout(function () {
                                //     var table = 'booking_request';
                                //     var where = 'id = '+booking_id;
                                //     var select = 'status';
            
                                //     functions.get_results_mysql(table,where,select,config.con, function(results){
            
                                //         status = results[0].status;
                                //         //console.log(typeof status);
                                //         if(status == 0){
                                //             var sql1 = "UPDATE booking_request set status = 2 WHERE id = "+booking_id+"";
                                //             functions.update_record_mysql(sql1,config.con);
                                //             var sql2 = "UPDATE availability set status = 0 WHERE user_id = "+advisor_id+"";
                                //             functions.update_record_mysql(sql2,config.con);
            
                                //             var customer_data = "SELECT wallet_amount FROM users WHERE id = "+user_id;
                                // 			config.con.query(customer_data, function (err, result_customer) {
                                //             	io.sockets.in(advisor_+advisor_id).emit('availibility_switch_off', {message: 'Toggle off'});
                                // 				var wallet_amount = result_customer[0].wallet_amount;
                                //                 send_push(advisor_id,'users', "TempleBliss", "Due to your unavailability, your availability mode set to off", 'general',booking_id);
                                //             	io.sockets.in(customer_+user_id).emit('request_reject', {advisor_id: advisor_id,type: type,wallet_amount: wallet_amount,message: 'Advisor is not responding to your request please try again'});
                                // 			});
                                //         } 
                                //     });
                                // }, 30000);
                                
                            } else {
                                var error_msg = 'Advisor is busy';
                                console.log('busy');
                                if(status == 0) {
                                    error_msg = 'Advisor is inactive';
                                }
            
                                var customer_data = "SELECT wallet_amount FROM users WHERE id = "+user_id;
                                config.con.query(customer_data, function (err, result_customer) {
                                    var wallet_amount = result_customer[0].wallet_amount;
            
                                    io.sockets.in(customer_+user_id).emit('booking_request', {wallet_amount: wallet_amount,message: error_msg });
            
                                    io.sockets.in(customer_+user_id).emit('booking_request_android', {wallet_amount: wallet_amount,message: error_msg});
                                });
                            }
                        });

                    }else{

                        var error_msg = "Your wallet balance is lower than session amount";
                        console.log(error_msg);
                        io.sockets.in(customer_+user_id).emit('booking_request', {wallet_amount: result_user_wallet_data[0].wallet_amount,message: error_msg });

                    }

                });

            })
        }
    });

    socket.on('request_accept',function(data){

        var user_id    = functions.validate_params(data.user_id);
        var advisor_id = functions.validate_params(data.advisor_id);
        var booking_id = functions.validate_params(data.booking_id);
        var type       = functions.validate_params(data.type);
        
        console.log('request accept', data);
        if(user_id !== false && advisor_id !== false && type !== false && booking_id !== false ) {
                
            var start_time = latest_date();
            var default_message = "Hello";

            if(type == "chat"){
            	var sql_chat = "UPDATE booking_request set is_session_running = 1 WHERE id = "+booking_id+"";
            	//console.log('accept_chat',sql_chat)
            	functions.update_record_mysql(sql_chat,config.con);

                // var sql = "Insert into chat_history(sender_type,sender_id,receiver_type,receiver_id,message,created_at,booking_id)values('customer','"+user_id+"','advisor','"+advisor_id+"','"+default_message+"','"+start_time+"','"+booking_id+"')";

                // functions.insert_record_mysql(sql,config.con);

                var sql4 = "UPDATE booking_request set start_time = '"+start_time+"',status_update_date = '"+start_time+"',status = 1 WHERE id = "+booking_id+"";
                functions.update_record_mysql(sql4,config.con);
                
                var sql5 = "UPDATE availability set status = 2 WHERE user_id = "+advisor_id;
                functions.update_record_mysql(sql5,config.con);
            }
            // console.log(sql4);

            var user_data = "SELECT users.profile_picture as customer_profile_picture, advisor.profile_picture as advisor_profile_picture,advisor.nick_name as advisor_name,users.full_name as customer_name FROM users JOIN users as advisor on advisor.id = "+advisor_id+" WHERE users.id = "+user_id;
            config.con.query(user_data, function (err, result_user) {
                
                var user_data2 = "SELECT minute FROM booking_request WHERE id = "+booking_id;
                //console.log(user_data2);
                config.con.query(user_data2, function (err2, result_user2) {
                    var minute = result_user2[0].minute;
                    //console.log(result_user);
                    var advisor_profile_picture = result_user[0].advisor_profile_picture;
                    var customer_profile_picture = result_user[0].customer_profile_picture;
                    var advisor_name = result_user[0].advisor_name;
                    var customer_name = result_user[0].customer_name;

                    io.sockets.in(customer_+user_id).emit('request_accept', {advisor_id: advisor_id,type: type,customer_profile_picture: customer_profile_picture,advisor_profile_picture: advisor_profile_picture,advisor_name: advisor_name,customer_name: customer_name,start_time: start_time,booking_id: booking_id,default_message: default_message,minute:minute,message: 'Request accepted'});

                    io.sockets.in(advisor_+advisor_id).emit('request_accept', {user_id: user_id,type: type,customer_profile_picture: customer_profile_picture,advisor_profile_picture: advisor_profile_picture,advisor_name: advisor_name,customer_name: customer_name,start_time: start_time,booking_id: booking_id,default_message: default_message,minute:minute,message: 'Request accepted'});

                    io.sockets.in("normal_users").emit("advisor_buzy", {advisor_id: advisor_id});
                });
            });
            
        }
    });
    
    socket.on('request_reject',function(data){

        var user_id    = functions.validate_params(data.user_id);
        var advisor_id = functions.validate_params(data.advisor_id);
        var booking_id = functions.validate_params(data.booking_id);
        var type       = functions.validate_params(data.type);
        
        console.log('request reject function', data);
        if(user_id !== false && advisor_id !== false && type !== false && booking_id !== false ) {
                
            var start_time = latest_date();
            var sql4 = "UPDATE booking_request set status_update_date = '"+start_time+"',status = 2,reject_call_detail = 1 WHERE id = "+booking_id;
            functions.update_record_mysql(sql4,config.con);

            var available_for_data = "SELECT available_for FROM users WHERE id = "+advisor_id;
            config.con.query(available_for_data, function (err, result_available_for_data) {

                var type = result_available_for_data[0].available_for;
            
                var available_for = "UPDATE availability set status = 1 WHERE type IN("+type+") AND user_id = "+advisor_id;
                functions.update_record_mysql(available_for,config.con);

                var available_for_inactive = "UPDATE availability set status = 0 WHERE type NOT IN("+type+") AND user_id = "+advisor_id;
                functions.update_record_mysql(available_for_inactive,config.con);

            });
            
            var user_data = "SELECT nick_name FROM users WHERE id = "+advisor_id;
            config.con.query(user_data, function (err, result_user) {
                var nick_name = result_user[0].nick_name;
                var customer_data = "SELECT wallet_amount FROM users WHERE id = "+user_id;
                config.con.query(customer_data, function (err, result_customer) {
                	var wallet_amount = result_customer[0].wallet_amount;
                	io.sockets.in(customer_+user_id).emit('request_reject', {type: type,booking_id: booking_id, nick_name:nick_name,wallet_amount : wallet_amount, message: 'Request rejected'});
                });
            });
            
        }
    });

    socket.on('check_typing', function (data) {

        var sender_id = functions.validate_params(data.sender_id);
        var sender_type = functions.validate_params(data.sender_type);
        var receiver_id = functions.validate_params(data.receiver_id);
        var receiver_type = functions.validate_params(data.receiver_type);
        var booking_id = functions.validate_params(data.booking_id);
        // console.log('check_typing : ',data);

        if(sender_id !== false && sender_type !== false && receiver_id !== false && receiver_type !== false )
        {
            if(receiver_type == "Customer" || receiver_type == "customer")
            {
                io.sockets.in(customer_+receiver_id).emit('check_typing', {booking_id: booking_id, message: 'Typing'});
            }
            else
            {
                io.sockets.in(advisor_+receiver_id).emit('check_typing', {booking_id: booking_id, message: 'Typing'});
            }
        }

        setTimeout(function () {
            io.sockets.in(advisor_+receiver_id).emit('check_typing2', {booking_id: booking_id, message: 'Typing2 ...'});
        }, 30000);
    });

    socket.on('stop_timer', function (data) {
        var start_time = latest_date();
        console.log('stop_timer',data);
        var sender_id = functions.validate_params(data.sender_id);
        var receiver_id = functions.validate_params(data.receiver_id);
        var booking_id = functions.validate_params(data.booking_id);

        var sql4 = "UPDATE booking_request set popup_start_time = '"+start_time+"' WHERE id = "+booking_id+"";
        functions.update_record_mysql(sql4,config.con);

        io.sockets.in(advisor_+receiver_id).emit('stop_timer', {booking_id: booking_id,sender_id: sender_id,receiver_id: receiver_id,message: 'Waiting for client to add minutes'});
    });

    socket.on('advisor_to_customer', function (data) {

        var customer_id = functions.validate_params(data.customer_id);
        var advisor_id = functions.validate_params(data.advisor_id);
        var status = functions.validate_params(data.status);
        
        console.log('advisor_to_customer : ',data);
        io.sockets.in(customer_+customer_id).emit('advisor_to_customer', {customer_id: customer_id,advisor_id: advisor_id,status: status,message: ''});
    });

    socket.on('resume_timer', function (data) {

        console.log('resume_timer');

        var end_time = latest_date();
        var sender_id = functions.validate_params(data.sender_id);
        var receiver_id = functions.validate_params(data.receiver_id);
        var booking_id = functions.validate_params(data.booking_id);

        var sql4 = "UPDATE booking_request set popup_end_time = '"+end_time+"' WHERE id = "+booking_id+"";
        functions.update_record_mysql(sql4,config.con);

        io.sockets.in(advisor_+receiver_id).emit('resume_timer', {booking_id: booking_id,sender_id: sender_id,receiver_id: receiver_id,message: 'Resume Timer'});

    });

    socket.on('all_message_read', function (data) {

        var sender_id = functions.validate_params(data.sender_id);
        var sender_type = functions.validate_params(data.sender_type);
        var receiver_id = functions.validate_params(data.receiver_id);
        var receiver_type = functions.validate_params(data.receiver_type);
        var booking_id = functions.validate_params(data.booking_id);

        if(sender_id !== false && sender_type !== false && receiver_id !== false && receiver_type !== false)
        {
            if(sender_type == "Customer" || sender_type == "customer")
            {
                io.sockets.in(advisor_+receiver_id).emit('all_message_read', {message : "all message are read"});
            }
            else
            {
                io.sockets.in(customer_+receiver_id).emit('all_message_read', {message : "all message are read"});
            }
            var sql = "UPDATE chat_history set read_status = 1 WHERE booking_id = "+booking_id+" and receiver_id = "+sender_id+" ";
            functions.update_record_mysql(sql,config.con);
        }
    });
    
    socket.on('send_message', function (data) {

	  	var sender_id = functions.validate_params(data.sender_id);  
	  	var sender_type = functions.validate_params(data.sender_type);  
	  	var receiver_id = functions.validate_params(data.receiver_id);  
	  	var receiver_type = functions.validate_params(data.receiver_type);  
	  	var message = functions.validate_params(data.message);  
	  	var booking_id = functions.validate_params(data.booking_id);  
	  	//console.log('send_messages : ',data);

	  	if(sender_id !== false && sender_type !== false && receiver_id !== false && receiver_type !== false && message !== false)
	  	{
	  		message = message.replace(/'/g, "\\'");
	  		
			var current_date = latest_date();
			var table = 'users';
	        var where = 'id = '+sender_id;
	        var select = 'full_name,nick_name,profile_picture'; 

	        functions.get_results_mysql(table,where,select,config.con, function(results){

		  		if(sender_type == "Advisor" || sender_type == "advisor")
		  		{    
                    var message_type = "session";
                    var table = 'booking_request';
                    var where = 'id = '+booking_id+' AND end_time IS NOT NULL';
                    var select = 'id,end_session_messages';

                    functions.get_results_mysql(table,where,select,config.con, function(sub_results){
                        
                        if (sub_results !== undefined && sub_results !== null && sub_results.length > 0)
                        {
                            message_type = "free";
                        }
                        
                        var sql = "Insert into chat_history(sender_type,sender_id,receiver_type,receiver_id,message,created_at,booking_id,message_type)values('"+sender_type+"','"+sender_id+"','"+receiver_type+"','"+receiver_id+"','"+message.toString()+"','"+current_date+"','"+booking_id+"','"+message_type+"')";
                        
                        functions.insert_record_mysql(sql,config.con);

                        io.sockets.in(customer_+receiver_id).emit('send_message', {sender_id : sender_id,sender_type : sender_type,receiver_id: receiver_id,receiver_type : receiver_type,message : message.toString(),booking_id : booking_id,user:results[0],current_date:current_date,message_send_date : current_date});

                        io.sockets.in(advisor_+sender_id).emit('send_message', {sender_id : sender_id,sender_type : sender_type,receiver_id: receiver_id,receiver_type : receiver_type,message : message.toString(),booking_id : booking_id,user:results[0],current_date:current_date,message_send_date : current_date});

                        io.sockets.in(customer_+receiver_id).emit('send_message_android', {sender_id : sender_id,sender_type : sender_type,receiver_id: receiver_id,receiver_type : receiver_type,message : utf8.encode(message.toString()),booking_id : booking_id,user:results[0],current_date:current_date,message_send_date : current_date});

                        io.sockets.in(advisor_+sender_id).emit('send_message_android', {sender_id : sender_id,sender_type : sender_type,receiver_id: receiver_id,receiver_type : receiver_type,message : utf8.encode(message.toString()),booking_id : booking_id,user:results[0],current_date:current_date,message_send_date : current_date});
                        
                        var send_push_data = {};
                        send_push_data['sender_id']         = sender_id;
                        send_push_data['sender_type']       = sender_type;
                        send_push_data['receiver_id']       = receiver_id;
                        send_push_data['receiver_type']     = receiver_type;
                        send_push_data['message']           = message;
                        send_push_data['booking_id']        = booking_id;
                        send_push_data['user']              = results[0];
                        send_push_data['type']              = "";
                        if(message_type == 'free'){
                            send_push_data['type']          = "post_chat";
                        }
                        send_push_data['current_date']      = current_date;
                        send_push_data['message_send_date'] = current_date;
                        
                        if(send_push_data['type'] == "post_chat"){
                            send_push(receiver_id,'users','New Message',message,'chat',booking_id,send_push_data);	                		
                        }
                    });
		      		
		  		}
		  		else
		  		{
                    var message_count = 0;
                    var message_status = true;
                    var message_type = "session";
                    var note = '';
                    var table = 'booking_request';
                    var where = 'id = '+booking_id+' AND end_time IS NOT NULL';
                    var select = 'id,end_session_messages,note';
                    var send_push_data = {};
                    send_push_data['type']    = ""; 
                    functions.get_results_mysql(table,where,select,config.con, function(sub_results){

                        if (sub_results !== undefined && sub_results !== null && sub_results.length > 0)
                        {
                            message_type = "free";
                            if(sub_results[0].end_session_messages == 0){

                                message_status = false

                                io.sockets.in(customer_+sender_id).emit('send_message', {sender_id : sender_id,sender_type : sender_type,receiver_id: receiver_id,receiver_type : receiver_type,message : message.toString(),booking_id : booking_id,user:sub_results[0],current_date:current_date,message_send_date : current_date,status: false});

                                io.sockets.in(customer_+sender_id).emit('send_message_android', {sender_id : sender_id,sender_type : sender_type,receiver_id: receiver_id,receiver_type : receiver_type,message : utf8.encode(message.toString()),booking_id : booking_id,user:sub_results[0],current_date:current_date,message_send_date : current_date,status: false});

                            } else {

                                message_count = sub_results[0].end_session_messages - 1;
                                var sql4 = "UPDATE booking_request set end_session_messages = '"+message_count+"' WHERE id = "+booking_id;
                                functions.update_record_mysql(sql4,config.con);
                                send_push_data['type']    = "post_chat"; 
                                message_status = true;
                                note = sub_results[0].note;

                            }   
                        }
                       
                        if(message_status == true){

                            var sql = "Insert into chat_history(sender_type,sender_id,receiver_type,receiver_id,message,created_at,booking_id,message_type)values('"+sender_type+"','"+sender_id+"','"+receiver_type+"','"+receiver_id+"','"+message.toString()+"','"+current_date+"','"+booking_id+"','"+message_type+"')";

                            functions.insert_record_mysql(sql,config.con);
                        
                            send_push_data['sender_id']         = sender_id;
                            send_push_data['sender_type']       = sender_type;
                            send_push_data['receiver_id']       = receiver_id;
                            send_push_data['receiver_type']     = receiver_type;
                            send_push_data['message']           = message;
                            send_push_data['booking_id']        = booking_id;
                            send_push_data['user']              = results[0];
                            send_push_data['current_date']      = current_date;                 
                            send_push_data['message_send_date'] = current_date;                 
                            send_push_data['note']              = note;                 
    
                            if(send_push_data['type'] == "post_chat"){
                                send_push(receiver_id,'users','New Message',message,'chat',booking_id,send_push_data);
                            }
                            
                            io.sockets.in(advisor_+receiver_id).emit('send_message', {sender_id : sender_id,sender_type : sender_type,receiver_id: receiver_id,receiver_type : receiver_type,message : message.toString(),booking_id : booking_id,user:results[0],current_date:current_date,message_send_date : current_date,message_type:message_type});

                            io.sockets.in(customer_+sender_id).emit('send_message', {sender_id : sender_id,sender_type : sender_type,receiver_id: receiver_id,receiver_type : receiver_type,message : message.toString(),booking_id : booking_id,user:results[0],current_date:current_date,message_send_date : current_date,message_count:message_count, message_type:message_type,status: true});

                            io.sockets.in(advisor_+receiver_id).emit('send_message_android', {sender_id : sender_id,sender_type : sender_type,receiver_id: receiver_id,receiver_type : receiver_type,message : utf8.encode(message.toString()),booking_id : booking_id,user:results[0],current_date:current_date,message_send_date : current_date,message_type:message_type});

                            io.sockets.in(customer_+sender_id).emit('send_message_android', {sender_id : sender_id,sender_type : sender_type,receiver_id: receiver_id,receiver_type : receiver_type,message : utf8.encode(message.toString()),booking_id : booking_id,user:results[0],current_date:current_date,message_send_date : current_date,message_count:message_count, message_type:message_type,status: true});
                        }
                        
                    });
		  		}

		  	});
		}
	});
    
    socket.on('buy_more_minute',function(data){

        var user_id    = functions.validate_params(data.user_id);
        var advisor_id = functions.validate_params(data.advisor_id);
        var booking_id = functions.validate_params(data.booking_id);
        var minute     = functions.validate_params(data.minute);
        //console.log('buy_more_minute', data);
        if(user_id !== false && advisor_id !== false && minute !== false && booking_id !== false ) {
                
            var current_date = latest_date();
            var sql = "Insert into minutes_log(booking_id,minute,created_at)values("+booking_id+",'"+minute+"','"+current_date+"')";
            functions.insert_record_mysql(sql,config.con);
            
            var booking_details = "SELECT minute FROM booking_request WHERE id = "+booking_id;
            config.con.query(booking_details, function (err, result_booking) {

                var old_minute = result_booking[0].minute;
                console.log('old-minute1',old_minute);
                var total_minute =parseInt(minute) + parseInt(old_minute);
                console.log('total_minute',total_minute);
                var sql = "UPDATE booking_request set minute = '"+total_minute+"' WHERE id = "+booking_id;
                functions.update_record_mysql(sql,config.con);

            });

            var user_data = "SELECT full_name FROM users WHERE id = "+user_id;
            config.con.query(user_data, function (err, result_user) {
                var full_name = result_user[0].full_name;
                io.sockets.in(advisor_+advisor_id).emit('buy_more_minute', {minute: minute,booking_id: booking_id, full_name:full_name, message: 'Customer extend the session for '+minute+' minutes.'});
            });
        }
    });

    socket.on('end_session',function(data){

        var user_id    = functions.validate_params(data.user_id);
        var advisor_id = functions.validate_params(data.advisor_id);
        var booking_id = functions.validate_params(data.booking_id);
        var minute     = functions.validate_params(data.minute);
        var amount     = functions.validate_params(data.amount);
        var dob        = functions.validate_params(data.dob);
        if(dob !== false && dob !== ''){
        	var date_of_birth  = dob.split(" ");
        	var dob_explode = date_of_birth[0].split("-"); 
	        var month_day = dob_explode[1]+"-"+dob_explode[2];
        }
        var total_minute = 0;
        var explode_minute = minute.split(":");
        var booking_amount = (parseFloat(amount) * parseFloat(explode_minute[0])) + ((parseFloat(amount)/60) * parseFloat(explode_minute[1]));
        var chargeable_amount = 0;
        var total_chargeable_amount = 0;
        var wallet_amount = 0;
        var type = '';
        var free_minute = 0;
        var discount_value = 0;
        var promocode_ids = '';
        var advisor_commission_amount = 0;
        var withdrawal_amount = 0;
        var promocode_applied = 0;
        var advisor_special_day_commission = 0;
        var after_promocode_minute = 0;
        console.log('end_session', data);
        console.log('end_session_main');

        var total_add_minute = 0;
        if(user_id !== false && advisor_id !== false && booking_id !== false && minute !== false && amount !== false && dob !== false) {
                
            var current_date = latest_date();

            var total_main_minute = "SELECT minute FROM booking_request WHERE id = "+booking_id;
            config.con.query(total_main_minute, function (err, result_total_main_minute) {

                var min_to_sec = parseFloat(explode_minute[0]) * 60;
                var session_sec = parseFloat(explode_minute[1]);
                var total_sec = min_to_sec + session_sec;

                var added_minute = "SELECT SUM(minute) as added_minute FROM minutes_log WHERE booking_id = "+booking_id;
                config.con.query(added_minute, function (err, result_added_minute) {

                    // if(result_added_minute[0].added_minute != "NULL" && result_added_minute[0].added_minute != null && result_added_minute[0].added_minute != 0 && result_added_minute[0].added_minute != undefined){
                    //     console.log('inside_buy_minute_function');
                    //     total_add_minute = result_total_main_minute[0].minute + result_added_minute[0].added_minute;
                    //     var total_add_minute_sec = total_add_minute * 60;
                    //     if(total_sec > total_add_minute_sec){
                    //         minute = "0"+total_add_minute+":00";
                    //     }
                    //     console.log('inside_buy_minute_Minute',minute);
                    // }else{
                    //     console.log('main_added_minute_function');
                    //     var total_add_minute_sec = result_total_main_minute[0].minute * 60;
                    //     if(total_sec > total_add_minute_sec){
                    //         minute = "0"+result_total_main_minute[0].minute+":00";
                    //     }
                    //     console.log('main_added_minute_Minute',minute);
                    // } 

                    console.log('main_added_minute_function');
                    var total_add_minute_sec = result_total_main_minute[0].minute * 60;
                    if(total_sec > total_add_minute_sec){
                        minute = "0"+result_total_main_minute[0].minute+":00";
                    }
                    console.log('main_added_minute_Minute',minute);

                    var user_first_time = "SELECT COUNT(id) as number FROM booking_request WHERE user_id = "+user_id+" AND status = 1";
                    config.con.query(user_first_time, function (err, result_user) {

                        var category_details = "SELECT category.name as category_name,free_minute,minute FROM booking_request left join category on booking_request.category_id = category.id WHERE booking_request.id = "+booking_id+"";
                        config.con.query(category_details, function (err, category_details_result) {
                        var category_name = category_details_result[0].category_name;
                        
                            var advisor_commission = "SELECT value FROM settings WHERE name = 'advisor_commission'";
                            config.con.query(advisor_commission, function (err, advisor_commission_result) {

                                var available_for_data = "SELECT available_for FROM users WHERE id = "+advisor_id;
                                config.con.query(available_for_data, function (err, result_available_for_data) {

                                    var type = result_available_for_data[0].available_for; 
                                
                                    var available_for_active = "UPDATE availability set status = 1 WHERE type IN("+type+") AND user_id = "+advisor_id;
                                    functions.update_record_mysql(available_for_active,config.con);

                                    var available_for_inactive = "UPDATE availability set status = 0 WHERE type NOT IN("+type+") AND user_id = "+advisor_id;
                                    functions.update_record_mysql(available_for_inactive,config.con);
                                    
                                });

                                if (advisor_commission_result !== undefined && advisor_commission_result !== null && advisor_commission_result.length > 0){
                                    //console.log('booking_amount_before',booking_amount);
                                    //booking_amount = booking_amount.toFixed(2);
                                    //console.log('booking_amount_after',booking_amount);
                                    if(result_user[0].number == 1){

                                        var first_time_promocode = "SELECT * FROM promocode WHERE promocode_type = 'first_time' AND status = 1 AND deleted_at IS NULL";
                                            config.con.query(first_time_promocode, function (err, result_user_promocode) {
                                            console.log('first_time_promocode',result_user_promocode);
                                            if(result_user_promocode !== undefined && result_user_promocode !== null && result_user_promocode.length > 0){
                                                console.log('first_time_promocode_inside',result_user_promocode);
                                                if(parseFloat(explode_minute[0]) >= parseFloat(result_user_promocode[0].min_minute)){

                                                    after_promocode_minute = parseFloat(category_details_result[0].minute) - parseFloat(category_details_result[0].free_minute); 

                                                    total_minute = minute;
                                                    chargeable_amount = (parseFloat(amount) * parseFloat(total_minute)) + ((parseFloat(amount)/60) * parseFloat(explode_minute[1]));
                                                    if(parseFloat(explode_minute[0]) >= after_promocode_minute){
                                                        
                                                        var sql = "UPDATE booking_request set promocode_minute = '"+minute+"' WHERE id = "+booking_id;
                                                        functions.update_record_mysql(sql,config.con);

                                                        total_minute = "0" + after_promocode_minute + ":" + "00";
                                                        chargeable_amount = (parseFloat(amount) * parseFloat(total_minute));
                                                        console.log('in_promocode');
                                                    }
                                                    console.log('total_minute',total_minute);
                                                    console.log('chargeable_amount',chargeable_amount);
                                                    // total_minute =  parseFloat(explode_minute[0]) -  parseFloat(result_user_promocode[0].free_minute) + ":" + parseFloat(explode_minute[1]);
                                                    console.log('first_time_chargable_amount',chargeable_amount);
                                                    total_chargeable_amount = total_chargeable_amount + chargeable_amount;
                                                    console.log('total_chargeable_amount_first_time',total_chargeable_amount);
                                                    // free_minute = result_user_promocode[0].free_minute;
                                                    free_minute = "0" + category_details_result[0].free_minute + ":" + "00";

                                                    var sql = "Insert into promocode_log(booking_id,promocode_id,total_minute,chargeable_minute,booking_amount,chargeable_amount,user_id,created_at)values("+booking_id+","+result_user_promocode[0].id+",'"+minute+"','"+total_minute+"','"+booking_amount.toFixed(2)+"','"+chargeable_amount.toFixed(2)+"',"+user_id+",'"+latest_date()+"')";
                                                    functions.insert_record_mysql(sql,config.con);

                                                    promocode_ids = (promocode_ids != '') ? promocode_ids+","+result_user_promocode[0].id : result_user_promocode[0].id;
                                                    console.log('first_time',result_user_promocode[0].id,minute,total_minute,booking_amount,chargeable_amount);
                                                }
                                            }
                                            
                                            if(month_day == latest_date_only()){
                                                console.log('in_dob');
                                                var user_birthday = "SELECT * FROM promocode WHERE promocode_type = 'birthday' AND status = 1 AND deleted_at IS NULL";
                                                config.con.query(user_birthday, function (err, result_user_promocode) {

                                                    if(result_user_promocode !== undefined && result_user_promocode !== null && result_user_promocode.length > 0){

                                                        if(total_chargeable_amount == '0' || total_chargeable_amount == '0.00' || total_chargeable_amount == 0){
                                                            total_chargeable_amount = booking_amount;
                                                        }
                                                        if(total_minute == 0 || total_minute == '0'){
                                                            total_minute = minute;
                                                        }

                                                        if(result_user_promocode[0].discount_type == 'flat'){
                                                            //	chargeable_amount = booking_amount - parseFloat(result_user_promocode[0].discount_value);
                                                            if(total_chargeable_amount > parseFloat(result_user_promocode[0].discount_value)){
                                                                chargeable_amount = total_chargeable_amount - parseFloat(result_user_promocode[0].discount_value);
                                                                promocode_applied = 1;
                                                            }else{
                                                                chargeable_amount = total_chargeable_amount;
                                                            }
                                                        }else{
                                                            //	chargeable_amount = booking_amount - (booking_amount * parseFloat(result_user_promocode[0].discount_value))/100;
                                                            var percentage_amount = (total_chargeable_amount * parseFloat(result_user_promocode[0].discount_value))/100;
                                                            if(total_chargeable_amount > percentage_amount.toFixed(2)){
                                                                chargeable_amount = total_chargeable_amount - percentage_amount;
                                                                promocode_applied = 1;
                                                            }else{
                                                                chargeable_amount = total_chargeable_amount;
                                                            }
                                                        }

                                                        console.log('total_chargeable_amount_in_birthday_before',total_chargeable_amount);
                                                        //console.log('birthday_chargable_amount',chargeable_amount);
                                                        //	total_chargeable_amount = total_chargeable_amount + chargeable_amount;
                                                        total_chargeable_amount = chargeable_amount;
                                                        console.log('total_chargeable_amount_in_birthday',total_chargeable_amount);
                                                        type = result_user_promocode[0].discount_type;
                                                        discount_value = result_user_promocode[0].discount_value;

                                                        if(promocode_applied == 1){
                                                            var sql = "Insert into promocode_log(booking_id,promocode_id,total_minute,chargeable_minute,booking_amount,chargeable_amount,user_id,created_at)values("+booking_id+","+result_user_promocode[0].id+",'"+minute+"','"+total_minute+"','"+booking_amount.toFixed(2)+"','"+chargeable_amount.toFixed(2)+"',"+user_id+",'"+latest_date()+"')";
                                                            functions.insert_record_mysql(sql,config.con);
                                                            promocode_ids = (promocode_ids != '') ? promocode_ids+","+result_user_promocode[0].id : result_user_promocode[0].id;
                                                        }
                                                        // promocode_ids = promocode_ids+","+result_user_promocode[0].id;
                                                        console.log('first_time with birthday',result_user_promocode[0].id,minute,total_minute,booking_amount,chargeable_amount);

                                                        var user_details = "SELECT id,wallet_amount FROM users WHERE id = '"+user_id+"'";
                                                        config.con.query(user_details, function (err, result_user_details) {

                                                            wallet_amount = parseFloat(result_user_details[0].wallet_amount) - parseFloat(total_chargeable_amount);

                                                            var sql = "UPDATE users set wallet_amount = '"+(wallet_amount).toFixed(2)+"' WHERE id = "+user_id;
                                                            functions.update_record_mysql(sql,config.con);

                                                            var sql1 = "Insert into wallet(user_id,booking_id,amount_type,amount,description,created_at)values("+user_id+",'"+booking_id+"','minus','"+(total_chargeable_amount).toFixed(2)+"','Payment Done','"+latest_date()+"')";
                                                            functions.insert_record_mysql(sql1,config.con);

                                                            advisor_commission_amount = (total_chargeable_amount * parseFloat(advisor_commission_result[0].value))/100;
                                                            admin_commission_amount = ( (total_chargeable_amount) * (100 - parseFloat(advisor_commission_result[0].value) ) )/100;

                                                            var advisor_special_day_promocode = "SELECT *,DATE_FORMAT(special_day_date, '%Y-%m-%d') as special_day FROM promocode WHERE promocode_for = 'advisor' AND status = 1 AND deleted_at IS NULL";
                                                            config.con.query(advisor_special_day_promocode, function (err, result_advisor_promocode) {

                                                                if(result_advisor_promocode !== undefined && result_advisor_promocode !== null && result_advisor_promocode.length > 0){

                                                                    var advisor_day  = (result_advisor_promocode[0].special_day);
                                                                    if(date_only() == advisor_day){
                                                                        //new code
                                                                        var advisor_total_commission = parseFloat(advisor_commission_result[0].value) + parseFloat(result_advisor_promocode[0].discount_value);
                                                                        if(advisor_total_commission > 100){
                                                                            advisor_total_commission = 100;
                                                                        }
                                                                        //console.log('advisor_total_commission',advisor_total_commission);
                                                                        var admin_total_commission = 100 - parseFloat(advisor_total_commission);
                                                                        //console.log('admin_total_commission',admin_total_commission);
                                
                                                                        advisor_commission_amount = (total_chargeable_amount * parseFloat(advisor_total_commission))/100;
                                                                        admin_commission_amount = ( (total_chargeable_amount) * parseFloat( admin_total_commission) )/100;
                                                                        // advisor_commission_amount = advisor_commission_amount.toFixed(3);
                                                                        // admin_commission_amount = admin_commission_amount.toFixed(3);
                                                                        advisor_special_day_commission = result_advisor_promocode[0].discount_value;
                                                                        if(result_advisor_promocode[0].discount_type == 'percentage'){

                                                                            var percentage_amount = (total_chargeable_amount * parseFloat(result_advisor_promocode[0].discount_value))/100;
                                                                            // var advisor_commission =  advisor_commission_amount;
                                                                            var old_advisor_commission = (total_chargeable_amount * parseFloat(advisor_commission_result[0].value))/100;
                                                                            // advisor_commission_amount = advisor_commission_amount + percentage_amount;
                        
                                                                            promocode_ids = (promocode_ids != '') ? promocode_ids+","+result_advisor_promocode[0].id : result_advisor_promocode[0].id;
                        
                                                                            var sql_special_day = "Insert into promocode_log(booking_id,promocode_id,total_minute,chargeable_minute,booking_amount,chargeable_amount,advisor_amount,advisor_special_day_amount,user_id,created_at)values("+booking_id+","+result_advisor_promocode[0].id+",'"+minute+"','"+total_minute+"','"+booking_amount.toFixed(2)+"','"+chargeable_amount.toFixed(2)+"','"+old_advisor_commission.toFixed(2)+"','"+percentage_amount.toFixed(2)+"',"+user_id+",'"+latest_date()+"')";
                                                                            functions.insert_record_mysql(sql_special_day,config.con);
                                                                        }
                                                                        // else{
                                                                        //     advisor_commission_amount = advisor_commission_amount + result_advisor_promocode[0].discount_value;
                                                                        // }
                                                                    }
                                                                }

                                                                var sql_update = "UPDATE booking_request set end_time = '"+current_date+"',total = '"+(total_chargeable_amount).toFixed(2)+"',advisor_commission = '"+advisor_commission_amount.toFixed(2)+"',admin_commission = '"+admin_commission_amount.toFixed(2)+"',session_minute = '"+total_minute+"',offer_id = '"+promocode_ids+"' WHERE id = "+booking_id;
                                                                functions.update_record_mysql(sql_update,config.con);

                                                                var advisor_amount_log = "Insert into advisor_amount_log(advisor_id,booking_id,amount,created_at)values("+advisor_id+",'"+booking_id+"','"+advisor_commission_amount.toFixed(2)+"','"+latest_date()+"')";
                                                                functions.insert_record_mysql(advisor_amount_log,config.con);
                                                                
                                                                // var sql5 = "UPDATE availability set status = 1 WHERE user_id = "+advisor_id;
                                                                //functions.update_record_mysql(sql5,config.con);
                                                                
                                                                var advisor_details = "SELECT id,advisor_withdrawal_amount FROM users WHERE id = '"+advisor_id+"'";
                                                                config.con.query(advisor_details, function (err, result_advisor_details) {

                                                                    withdrawal_amount = parseFloat(result_advisor_details[0].advisor_withdrawal_amount) + parseFloat(advisor_commission_amount);

                                                                    var update_advisor_amount = "UPDATE users set advisor_withdrawal_amount = "+withdrawal_amount.toFixed(2)+" WHERE id = "+advisor_id;
                                                                    functions.update_record_mysql(update_advisor_amount,config.con); 

                                                                });

                                                                io.sockets.in(customer_+user_id).emit('end_session', {total_minute: minute.toString(),free_minute: free_minute.toString(),booking_amount: booking_amount.toFixed(2).toString(),total_chargeable_amount: total_chargeable_amount.toFixed(2).toString(),discount_type: type.toString(), discount_value: discount_value.toString(),category_name: category_name.toString(), message: 'session end', wallet_amount: wallet_amount.toFixed(2)});

                                                                io.sockets.in(advisor_+advisor_id).emit('end_session', {total_minute: total_minute.toString(),commission_rate: (advisor_commission_result[0].value).toString(),session_earning: advisor_commission_amount.toFixed(2).toString(),advisor_special_day_commission: advisor_special_day_commission.toString(),category_name: category_name.toString(), message: 'Congratulations! You have earned $'+advisor_commission_amount.toFixed(2).toString()+' from this session'}); 

                                                            });

                                                        });

                                                    }
                                                    else{
                                                        var user_details = "SELECT id,wallet_amount FROM users WHERE id = '"+user_id+"'";
                                                        config.con.query(user_details, function (err, result_user_details) {
                            
                                                            if(total_chargeable_amount == '0' || total_chargeable_amount == '0.00' || total_chargeable_amount == 0){
                                                                total_chargeable_amount = booking_amount;
                                                            }
                                                            if(total_minute == 0 || total_minute == '0'){
                                                                total_minute = minute;
                                                            }
                                                            //console.log('wallet_amount',parseFloat(result_user_details[0].wallet_amount));
                                                            wallet_amount = parseFloat(result_user_details[0].wallet_amount) - total_chargeable_amount;
                            
                                                            var sql = "UPDATE users set wallet_amount = '"+(wallet_amount).toFixed(2)+"' WHERE id = "+user_id;
                                                            functions.update_record_mysql(sql,config.con);
                            
                                                            var sql1 = "Insert into wallet(user_id,booking_id,amount_type,amount,description,created_at)values("+user_id+",'"+booking_id+"','minus','"+total_chargeable_amount.toFixed(2)+"','Payment Done','"+latest_date()+"')";
                                                            functions.insert_record_mysql(sql1,config.con);
                            
                                                            advisor_commission_amount = (total_chargeable_amount * parseFloat(advisor_commission_result[0].value))/100;
                                                            admin_commission_amount = ( (total_chargeable_amount) * (100 -  parseFloat(advisor_commission_result[0].value)) )/100;
                                                            //console.log('advisor_commission_amount_before',advisor_commission_amount);
                                                            var advisor_special_day_promocode = "SELECT *,DATE_FORMAT(special_day_date, '%Y-%m-%d') as special_day FROM promocode WHERE promocode_for = 'advisor' AND status = 1 AND deleted_at IS NULL";
                                                            config.con.query(advisor_special_day_promocode, function (err, result_advisor_promocode) {

                                                                if(result_advisor_promocode !== undefined && result_advisor_promocode !== null && result_advisor_promocode.length > 0){
                                                                    //console.log('advisor_promocode',result_advisor_promocode[0]);
                                                                    var advisor_day  = (result_advisor_promocode[0].special_day);
                                                                    //console.log('advisor_promocode1',advisor_day);
                                                                    if(date_only() == advisor_day){

                                                                        console.log('advisor_special_day');
                                                                        var advisor_total_commission = parseFloat(advisor_commission_result[0].value) + parseFloat(result_advisor_promocode[0].discount_value);
                                                                        console.log('advisor_total_commission',advisor_total_commission);
                                                                        var admin_total_commission = 100 - parseFloat(advisor_total_commission);
                                                                        console.log('admin_total_commission',admin_total_commission);
                                                                        
                                                                        if(advisor_total_commission > 100){
                                                                            advisor_total_commission = 100;
                                                                        }

                                                                        advisor_commission_amount = (total_chargeable_amount * parseFloat(advisor_total_commission))/100;
                                                                        admin_commission_amount = ( (total_chargeable_amount) * parseFloat( admin_total_commission) )/100;
                                                                        // console.log('advisor_commission_amount',advisor_commission_amount);
                                                                        // console.log('admin_commission_amount',admin_commission_amount);
                            
                                                                        advisor_special_day_commission = result_advisor_promocode[0].discount_value;
                                                                        if(result_advisor_promocode[0].discount_type == 'percentage'){
                            
                                                                            var percentage_amount = (total_chargeable_amount * parseFloat(result_advisor_promocode[0].discount_value))/100;
                                                                            // var advisor_commission =  advisor_commission_amount;
                                                                            var old_advisor_commission = (total_chargeable_amount * parseFloat(advisor_commission_result[0].value))/100;
                                                                            // advisor_commission_amount = advisor_commission_amount + percentage_amount;
                            
                                                                            promocode_ids = (promocode_ids != '') ? promocode_ids+","+result_advisor_promocode[0].id : result_advisor_promocode[0].id;
                            
                                                                            var sql_special_day = "Insert into promocode_log(booking_id,promocode_id,total_minute,chargeable_minute,booking_amount,chargeable_amount,advisor_amount,advisor_special_day_amount,user_id,created_at)values("+booking_id+","+result_advisor_promocode[0].id+",'"+minute+"','"+total_minute+"','"+booking_amount.toFixed(2)+"','"+chargeable_amount.toFixed(2)+"','"+old_advisor_commission.toFixed(2)+"','"+percentage_amount.toFixed(2)+"',"+user_id+",'"+latest_date()+"')";
                                                                            functions.insert_record_mysql(sql_special_day,config.con);
                                                                        }
                                                                    }
                                                                }
                            
                                                                console.log('advisor_commission_amount',advisor_commission_amount);
                                                                console.log('admin_commission_amount',admin_commission_amount);

                                                                var sql = "UPDATE booking_request set end_time = '"+current_date+"',total = '"+total_chargeable_amount.toFixed(2)+"',advisor_commission = '"+advisor_commission_amount.toFixed(2)+"',admin_commission = '"+admin_commission_amount.toFixed(2)+"',offer_id = '"+promocode_ids+"',session_minute = '"+minute+"' WHERE id = "+booking_id;
                                                                functions.update_record_mysql(sql,config.con);
                            
                                                                var advisor_amount_log = "Insert into advisor_amount_log(advisor_id,booking_id,amount,created_at)values("+advisor_id+",'"+booking_id+"','"+advisor_commission_amount.toFixed(2)+"','"+latest_date()+"')";
                                                                functions.insert_record_mysql(advisor_amount_log,config.con);
                                                                
                                                                // var sql5 = "UPDATE availability set status = 1 WHERE user_id = "+advisor_id;
                                                                // functions.update_record_mysql(sql5,config.con);
                            
                                                                var advisor_details = "SELECT id,advisor_withdrawal_amount FROM users WHERE id = '"+advisor_id+"'";
                                                                config.con.query(advisor_details, function (err, result_advisor_details) {

                                                                    withdrawal_amount = parseFloat(result_advisor_details[0].advisor_withdrawal_amount) + parseFloat(advisor_commission_amount);
                            
                                                                    var update_advisor_amount = "UPDATE users set advisor_withdrawal_amount = "+withdrawal_amount.toFixed(2)+" WHERE id = "+advisor_id;
                                                                    functions.update_record_mysql(update_advisor_amount,config.con); 
                                                                    //console.log('update_advisor_amount',update_advisor_amount);
                                                                });
                            
                                                                //total_chargeable_amount = total_chargeable_amount;
                                                                //console.log('wallet_amount_updated',wallet_amount.toFixed(2));
                                                                io.sockets.in(customer_+user_id).emit('end_session', {total_minute: minute.toString(),free_minute: free_minute.toString(),booking_amount: booking_amount.toFixed(2).toString(),total_chargeable_amount: total_chargeable_amount.toFixed(2).toString(),discount_type: type.toString(), discount_value: discount_value.toString(),category_name: category_name.toString(), message: 'session end', wallet_amount: wallet_amount.toFixed(2)});

                                                                io.sockets.in(advisor_+advisor_id).emit('end_session', {total_minute: total_minute.toString(),commission_rate: (advisor_commission_result[0].value).toString(),session_earning: advisor_commission_amount.toFixed(2).toString(),advisor_special_day_commission: advisor_special_day_commission.toString(),category_name: category_name.toString(), message: 'Congratulations! You have earned $'+advisor_commission_amount.toFixed(2).toString()+' from this session'}); 
                                                            });
                                                        });
                                                    }
                                                });
            
                                            }else{
                                                console.log('else_dob');

                                                if(total_chargeable_amount == 0 || total_chargeable_amount == "0" || total_chargeable_amount == "0.00"){
                                                    total_chargeable_amount = booking_amount;
                                                }                                       
                                                if(total_minute == 0 || total_minute == '0'){
                                                    total_minute = minute;
                                                }

                                                var user_details = "SELECT id,wallet_amount FROM users WHERE id = '"+user_id+"'";
                                                config.con.query(user_details, function (err, result_user_details) {

                                                    wallet_amount = parseFloat(result_user_details[0].wallet_amount) - parseFloat(total_chargeable_amount);

                                                    var sql = "UPDATE users set wallet_amount = '"+(wallet_amount).toFixed(2)+"' WHERE id = "+user_id;
                                                    functions.update_record_mysql(sql,config.con);

                                                    var sql1 = "Insert into wallet(user_id,booking_id,amount_type,amount,description,created_at)values("+user_id+",'"+booking_id+"','minus','"+(total_chargeable_amount).toFixed(2)+"','Payment Done','"+latest_date()+"')";
                                                    functions.insert_record_mysql(sql1,config.con);

                                                    console.log('first_time with else');
                                                
                                                    advisor_commission_amount = (total_chargeable_amount * parseFloat(advisor_commission_result[0].value))/100;
                                                    admin_commission_amount = ( (total_chargeable_amount) * (100 - parseFloat(advisor_commission_result[0].value)) )/100;

                                                    var advisor_special_day_promocode = "SELECT *,DATE_FORMAT(special_day_date, '%Y-%m-%d') as special_day FROM promocode WHERE promocode_for = 'advisor' AND status = 1 AND deleted_at IS NULL";
                                                    config.con.query(advisor_special_day_promocode, function (err, result_advisor_promocode) {

                                                        if(result_advisor_promocode !== undefined && result_advisor_promocode !== null && result_advisor_promocode.length > 0){
                                                        var advisor_day  = (result_advisor_promocode[0].special_day);
                                                        
                                                            if(date_only() == advisor_day){

                                                                console.log('advisor_special_day');

                                                                var advisor_total_commission = parseFloat(advisor_commission_result[0].value) + parseFloat(result_advisor_promocode[0].discount_value);
                                                                console.log('advisor_total_commission',advisor_total_commission);
                                                                var admin_total_commission = 100 - parseFloat(advisor_total_commission);
                                                                console.log('admin_total_commission',admin_total_commission);
                                                                
                                                                if(advisor_total_commission > 100){
                                                                    advisor_total_commission = 100;
                                                                }

                                                                advisor_commission_amount = (total_chargeable_amount * parseFloat(advisor_total_commission))/100;
                                                                admin_commission_amount = ( (total_chargeable_amount) * parseFloat( admin_total_commission) )/100;
                                                                // advisor_commission_amount = advisor_commission_amount.toFixed(3);
                                                                // admin_commission_amount = admin_commission_amount.toFixed(3);
                                                                advisor_special_day_commission = result_advisor_promocode[0].discount_value;
                                                                if(result_advisor_promocode[0].discount_type == 'percentage'){

                                                                    var percentage_amount = (total_chargeable_amount * parseFloat(result_advisor_promocode[0].discount_value))/100;
                                                                    // var advisor_commission =  advisor_commission_amount;
                                                                    var old_advisor_commission = (total_chargeable_amount * parseFloat(advisor_commission_result[0].value))/100;
                                                                    // advisor_commission_amount = advisor_commission_amount + percentage_amount;

                                                                    promocode_ids = (promocode_ids != '') ? promocode_ids+","+result_advisor_promocode[0].id : result_advisor_promocode[0].id;

                                                                    var sql_special_day = "Insert into promocode_log(booking_id,promocode_id,total_minute,chargeable_minute,booking_amount,chargeable_amount,advisor_amount,advisor_special_day_amount,user_id,created_at)values("+booking_id+","+result_advisor_promocode[0].id+",'"+minute+"','"+total_minute+"','"+booking_amount.toFixed(2)+"','"+chargeable_amount.toFixed(2)+"','"+old_advisor_commission.toFixed(2)+"','"+percentage_amount.toFixed(2)+"',"+user_id+",'"+latest_date()+"')";
                                                                    functions.insert_record_mysql(sql_special_day,config.con);
                                                                }
                                                                //For Flat type add discount_value to advisor_commission and minus it from admin commission
                                                                // else{
                                                                //     advisor_commission_amount = advisor_commission_amount + result_advisor_promocode[0].discount_value;
                                                                // }
                                                            }
                                                        }
                                                        
                                                        var sql = "UPDATE booking_request set end_time = '"+current_date+"',total = '"+(total_chargeable_amount).toFixed(2)+"',advisor_commission = '"+(advisor_commission_amount).toFixed(2)+"',admin_commission = '"+(admin_commission_amount).toFixed(2)+"',session_minute = '"+total_minute+"',offer_id = '"+promocode_ids+"' WHERE id = "+booking_id;
                                                        functions.update_record_mysql(sql,config.con);

                                                        var advisor_amount_log = "Insert into advisor_amount_log(advisor_id,booking_id,amount,created_at)values("+advisor_id+",'"+booking_id+"','"+advisor_commission_amount.toFixed(2)+"','"+latest_date()+"')";
                                                        functions.insert_record_mysql(advisor_amount_log,config.con);
                                                        
                                                        //var sql5 = "UPDATE availability set status = 1 WHERE user_id = "+advisor_id;
                                                        //functions.update_record_mysql(sql5,config.con);

                                                        var advisor_details = "SELECT id,advisor_withdrawal_amount FROM users WHERE id = '"+advisor_id+"'";
                                                        config.con.query(advisor_details, function (err, result_advisor_details) {
                                                            
                                                            withdrawal_amount = parseFloat(result_advisor_details[0].advisor_withdrawal_amount) + parseFloat((advisor_commission_amount).toFixed(2));
                                                            
                                                            var update_advisor_amount = "UPDATE users set advisor_withdrawal_amount = "+(withdrawal_amount).toFixed(2)+" WHERE id = "+advisor_id;
                                                            functions.update_record_mysql(update_advisor_amount,config.con); 
                                                        });

                                                        io.sockets.in(customer_+user_id).emit('end_session', {total_minute: minute.toString(),free_minute: free_minute.toString(),booking_amount: booking_amount.toFixed(2).toString(),total_chargeable_amount: total_chargeable_amount.toFixed(2).toString(),discount_type: type.toString(), discount_value: discount_value.toString(),category_name: category_name.toString(), message: 'session end', wallet_amount: wallet_amount.toFixed(2)});

                                                        io.sockets.in(advisor_+advisor_id).emit('end_session', {total_minute: minute.toString(),commission_rate: (advisor_commission_result[0].value).toString(),session_earning: advisor_commission_amount.toFixed(2).toString(),
                                                        advisor_special_day_commission: advisor_special_day_commission.toString(),category_name: category_name.toString(), message: 'Congratulations! You have earned $'+advisor_commission_amount.toFixed(2).toString()+' from this session'}); 

                                                    });

                                                });		                            
                                            }

                                        });

                                    }else if(month_day == latest_date_only()){

                                        var user_birthday = "SELECT * FROM promocode WHERE promocode_type = 'birthday' AND status = 1 AND deleted_at IS NULL";
                                        config.con.query(user_birthday, function (err, result_user_promocode) {
                                            //console.log('result_user_promocode',result_user_promocode);
                                            if(result_user_promocode !== undefined && result_user_promocode !== null && result_user_promocode.length > 0){

                                                if(result_user_promocode[0].discount_type == 'flat'){

                                                    if(booking_amount > parseFloat(result_user_promocode[0].discount_value)){
                                                        chargeable_amount = booking_amount - parseFloat(result_user_promocode[0].discount_value);
                                                        promocode_applied = 1;
                                                    }else{
                                                        chargeable_amount = booking_amount;
                                                    }
                                                    // chargeable_amount = booking_amount - parseFloat(result_user_promocode[0].discount_value);

                                                }else{

                                                    // chargeable_amount = booking_amount - (booking_amount * parseFloat(result_user_promocode[0].discount_value))/100;
                                                    var percentage_amount = (booking_amount * parseFloat(result_user_promocode[0].discount_value))/100;
                                                    if(booking_amount > percentage_amount.toFixed(2)){
                                                        chargeable_amount = booking_amount - percentage_amount;
                                                        promocode_applied = 1;
                                                    }else{
                                                        chargeable_amount = booking_amount;
                                                    }
                                                }

                                                total_chargeable_amount = total_chargeable_amount + chargeable_amount;
                                            
                                                if(promocode_applied == 1){
                                                    type = result_user_promocode[0].discount_type;
                                                    discount_value = result_user_promocode[0].discount_value;   
                                                    var sql = "Insert into promocode_log(booking_id,promocode_id,total_minute,chargeable_minute,booking_amount,chargeable_amount,user_id,created_at)values("+booking_id+","+result_user_promocode[0].id+",'"+minute+"','"+minute+"','"+booking_amount.toFixed(2)+"','"+chargeable_amount.toFixed(2)+"',"+user_id+",'"+latest_date()+"')";
                                                    functions.insert_record_mysql(sql,config.con);
                                                    // promocode_ids = promocode_ids+","+result_user_promocode[0].id;
                                                    promocode_ids = (promocode_ids != '') ? promocode_ids+","+result_user_promocode[0].id : result_user_promocode[0].id;
                                                }
                                                
                                                console.log('birthday',result_user_promocode[0].id,minute,total_minute,booking_amount,chargeable_amount);
                                                var user_details = "SELECT id,wallet_amount FROM users WHERE id = '"+user_id+"'";
                                                config.con.query(user_details, function (err, result_user_details) {

                                                    //console.log('wallet_amount_before_update_main_endsession',result_user_details[0].wallet_amount);
                                                    wallet_amount = parseFloat(result_user_details[0].wallet_amount) - parseFloat(total_chargeable_amount);

                                                    var sql = "UPDATE users set wallet_amount = '"+(wallet_amount).toFixed(2)+"' WHERE id = "+user_id;
                                                    functions.update_record_mysql(sql,config.con);

                                                    var sql1 = "Insert into wallet(user_id,booking_id,amount_type,amount,description,created_at)values("+user_id+",'"+booking_id+"','minus','"+total_chargeable_amount+"','Payment Done','"+latest_date()+"')";
                                                    functions.insert_record_mysql(sql1,config.con);

                                                    advisor_commission_amount = (total_chargeable_amount * parseFloat(advisor_commission_result[0].value))/100;
                                                    admin_commission_amount = ( (total_chargeable_amount) * (100 -  parseFloat(advisor_commission_result[0].value)) )/100;
                                                    // advisor_commission_amount = advisor_commission_amount.toFixed(2);
                                                    // admin_commission_amount = admin_commission_amount.toFixed(2);

                                                    var advisor_special_day_promocode = "SELECT *,DATE_FORMAT(special_day_date, '%Y-%m-%d') as special_day FROM promocode WHERE promocode_for = 'advisor' AND status = 1 AND deleted_at IS NULL";
                                                    config.con.query(advisor_special_day_promocode, function (err, result_advisor_promocode) {

                                                        if(result_advisor_promocode !== undefined && result_advisor_promocode !== null && result_advisor_promocode.length > 0){

                                                            var advisor_day  = (result_advisor_promocode[0].special_day);

                                                            if(date_only() == advisor_day){

                                                                console.log('advisor_special_day');

                                                                var advisor_total_commission = parseFloat(advisor_commission_result[0].value) + parseFloat(result_advisor_promocode[0].discount_value);
                                                                console.log('advisor_total_commission',advisor_total_commission);
                                                                var admin_total_commission = 100 - parseFloat(advisor_total_commission);
                                                                console.log('admin_total_commission',admin_total_commission);
                                                                
                                                                if(advisor_total_commission > 100){
                                                                    advisor_total_commission = 100;
                                                                }

                                                                advisor_commission_amount = (total_chargeable_amount * parseFloat(advisor_total_commission))/100;
                                                                admin_commission_amount = ( (total_chargeable_amount) * parseFloat( admin_total_commission) )/100;
                                                                // advisor_commission_amount = advisor_commission_amount.toFixed(3);
                                                                // admin_commission_amount = admin_commission_amount.toFixed(3);
                                                                advisor_special_day_commission = result_advisor_promocode[0].discount_value;

                                                                if(result_advisor_promocode[0].discount_type == 'percentage'){

                                                                    var percentage_amount = (total_chargeable_amount * parseFloat(result_advisor_promocode[0].discount_value))/100;
                                                                    // var advisor_commission =  advisor_commission_amount;
                                                                    var old_advisor_commission = (total_chargeable_amount * parseFloat(advisor_commission_result[0].value))/100;
                                                                    // advisor_commission_amount = advisor_commission_amount + percentage_amount;

                                                                    promocode_ids = (promocode_ids != '') ? promocode_ids+","+result_advisor_promocode[0].id : result_advisor_promocode[0].id;

                                                                    var sql_special_day = "Insert into promocode_log(booking_id,promocode_id,total_minute,chargeable_minute,booking_amount,chargeable_amount,advisor_amount,advisor_special_day_amount,user_id,created_at)values("+booking_id+","+result_advisor_promocode[0].id+",'"+minute+"','"+total_minute+"','"+booking_amount.toFixed(2)+"','"+chargeable_amount.toFixed(2)+"','"+old_advisor_commission.toFixed(2)+"','"+percentage_amount.toFixed(2)+"',"+user_id+",'"+latest_date()+"')";
                                                                    functions.insert_record_mysql(sql_special_day,config.con);
                                                                }
                                                            }
                                                        }

                                                        var sql = "UPDATE booking_request set end_time = '"+current_date+"',total = '"+total_chargeable_amount.toFixed(2)+"',advisor_commission = '"+advisor_commission_amount.toFixed(2)+"',admin_commission = '"+admin_commission_amount.toFixed(2)+"',offer_id = '"+promocode_ids+"',session_minute = '"+minute+"' WHERE id = "+booking_id;
                                                        functions.update_record_mysql(sql,config.con);

                                                        var advisor_amount_log = "Insert into advisor_amount_log(advisor_id,booking_id,amount,created_at)values("+advisor_id+",'"+booking_id+"','"+advisor_commission_amount.toFixed(2)+"','"+latest_date()+"')";
                                                        functions.insert_record_mysql(advisor_amount_log,config.con);

                                                        // var sql5 = "UPDATE availability set status = 1 WHERE user_id = "+advisor_id;
                                                        // functions.update_record_mysql(sql5,config.con);
                                                        
                                                        var advisor_details = "SELECT id,advisor_withdrawal_amount FROM users WHERE id = '"+advisor_id+"'";
                                                        config.con.query(advisor_details, function (err, result_advisor_details) {
                                                            withdrawal_amount = parseFloat(result_advisor_details[0].advisor_withdrawal_amount) + parseFloat(advisor_commission_amount);

                                                            var update_advisor_amount = "UPDATE users set advisor_withdrawal_amount = "+withdrawal_amount.toFixed(2)+" WHERE id = "+advisor_id;
                                                            functions.update_record_mysql(update_advisor_amount,config.con); 

                                                        });


                                                        io.sockets.in(customer_+user_id).emit('end_session', {total_minute: minute.toString(),free_minute: free_minute.toString(),booking_amount: booking_amount.toFixed(2).toString(),total_chargeable_amount: total_chargeable_amount.toFixed(2).toString(),discount_type: type.toString(), discount_value: discount_value.toString(),category_name: category_name.toString(), message: 'session end', wallet_amount: wallet_amount.toFixed(2)});

                                                        io.sockets.in(advisor_+advisor_id).emit('end_session', {total_minute: minute.toString(),commission_rate: (advisor_commission_result[0].value).toString(),advisor_special_day_commission: advisor_special_day_commission.toString(),session_earning: advisor_commission_amount.toFixed(2).toString(),category_name: category_name.toString(), message: 'Congratulations! You have earned $'+advisor_commission_amount.toFixed(2).toString()+' from this session'});

                                                    });

                                                });

                                            }
                                            else{
                                                var user_details = "SELECT id,wallet_amount FROM users WHERE id = '"+user_id+"'";
                                                config.con.query(user_details, function (err, result_user_details) {
                    
                                                    //console.log('wallet_amount',parseFloat(result_user_details[0].wallet_amount));
                                                    wallet_amount = parseFloat(result_user_details[0].wallet_amount) - booking_amount;
                    
                                                    var sql = "UPDATE users set wallet_amount = '"+(wallet_amount).toFixed(2)+"' WHERE id = "+user_id;
                                                    functions.update_record_mysql(sql,config.con);
                    
                                                    var sql1 = "Insert into wallet(user_id,booking_id,amount_type,amount,description,created_at)values("+user_id+",'"+booking_id+"','minus','"+booking_amount.toFixed(2)+"','Payment Done','"+latest_date()+"')";
                                                    functions.insert_record_mysql(sql1,config.con);
                    
                                                    advisor_commission_amount = (booking_amount * parseFloat(advisor_commission_result[0].value))/100;
                                                    admin_commission_amount = ( (booking_amount) * (100 -  parseFloat(advisor_commission_result[0].value)) )/100;
                                                    //console.log('advisor_commission_amount_before',advisor_commission_amount);

                                                    var advisor_special_day_promocode = "SELECT *,DATE_FORMAT(special_day_date, '%Y-%m-%d') as special_day FROM promocode WHERE promocode_for = 'advisor' AND status = 1 AND deleted_at IS NULL";
                                                    config.con.query(advisor_special_day_promocode, function (err, result_advisor_promocode) {

                                                        if(result_advisor_promocode !== undefined && result_advisor_promocode !== null && result_advisor_promocode.length > 0){
                                                            //console.log('advisor_promocode',result_advisor_promocode[0]);
                                                            var advisor_day  = (result_advisor_promocode[0].special_day);
                                                            //console.log('advisor_promocode1',advisor_day);
                                                            if(date_only() == advisor_day){
                                                                console.log('advisor_special_day');
                    
                                                                var advisor_total_commission = parseFloat(advisor_commission_result[0].value) + parseFloat(result_advisor_promocode[0].discount_value);
                                                                console.log('advisor_total_commission',advisor_total_commission);
                                                                var admin_total_commission = 100 - parseFloat(advisor_total_commission);
                                                                console.log('admin_total_commission',admin_total_commission);
                                                                
                                                                if(advisor_total_commission > 100){
                                                                    advisor_total_commission = 100;
                                                                }

                                                                advisor_commission_amount = (booking_amount * parseFloat(advisor_total_commission))/100;
                                                                admin_commission_amount = ( (booking_amount) * parseFloat( admin_total_commission) )/100;
                                                                // console.log('advisor_commission_amount',advisor_commission_amount);
                                                                // console.log('admin_commission_amount',admin_commission_amount);
                    
                                                                advisor_special_day_commission = result_advisor_promocode[0].discount_value;
                                                                if(result_advisor_promocode[0].discount_type == 'percentage'){
                    
                                                                    var percentage_amount = (booking_amount * parseFloat(result_advisor_promocode[0].discount_value))/100;
                                                                    // var advisor_commission =  advisor_commission_amount;
                                                                    var old_advisor_commission = (booking_amount * parseFloat(advisor_commission_result[0].value))/100;
                                                                    // advisor_commission_amount = advisor_commission_amount + percentage_amount;
                    
                                                                    promocode_ids = (promocode_ids != '') ? promocode_ids+","+result_advisor_promocode[0].id : result_advisor_promocode[0].id;
                    
                                                                    var sql_special_day = "Insert into promocode_log(booking_id,promocode_id,total_minute,chargeable_minute,booking_amount,chargeable_amount,advisor_amount,advisor_special_day_amount,user_id,created_at)values("+booking_id+","+result_advisor_promocode[0].id+",'"+minute+"','"+total_minute+"','"+booking_amount.toFixed(2)+"','"+chargeable_amount.toFixed(2)+"','"+old_advisor_commission.toFixed(2)+"','"+percentage_amount.toFixed(2)+"',"+user_id+",'"+latest_date()+"')";
                                                                    functions.insert_record_mysql(sql_special_day,config.con);
                                                                }
                                                            }
                                                        }
                    
                                                        // console.log('advisor_commission_amount',advisor_commission_amount);
                                                        // console.log('admin_commission_amount',admin_commission_amount);

                                                        var sql = "UPDATE booking_request set end_time = '"+current_date+"',total = '"+booking_amount.toFixed(2)+"',advisor_commission = '"+advisor_commission_amount.toFixed(2)+"',admin_commission = '"+admin_commission_amount.toFixed(2)+"',offer_id = '"+promocode_ids+"',session_minute = '"+minute+"' WHERE id = "+booking_id; 
                                                        functions.update_record_mysql(sql,config.con);
                    
                                                        var advisor_amount_log = "Insert into advisor_amount_log(advisor_id,booking_id,amount,created_at)values("+advisor_id+",'"+booking_id+"','"+advisor_commission_amount.toFixed(2)+"','"+latest_date()+"')";
                                                        functions.insert_record_mysql(advisor_amount_log,config.con);
                                                        
                                                        // var sql5 = "UPDATE availability set status = 1 WHERE user_id = "+advisor_id;
                                                        // functions.update_record_mysql(sql5,config.con);
                    
                                                        var advisor_details = "SELECT id,advisor_withdrawal_amount FROM users WHERE id = '"+advisor_id+"'";
                                                        config.con.query(advisor_details, function (err, result_advisor_details) {
                                                            withdrawal_amount = parseFloat(result_advisor_details[0].advisor_withdrawal_amount) + parseFloat(advisor_commission_amount);
                    
                                                            var update_advisor_amount = "UPDATE users set advisor_withdrawal_amount = "+withdrawal_amount.toFixed(2)+" WHERE id = "+advisor_id;
                                                            functions.update_record_mysql(update_advisor_amount,config.con); 
                                                            console.log('update_advisor_amount',update_advisor_amount);
                                                        });
                    
                                                        total_chargeable_amount = booking_amount;
                                                        //console.log('wallet_amount_updated',wallet_amount.toFixed(2));
                                                        io.sockets.in(customer_+user_id).emit('end_session', {total_minute: minute.toString(),free_minute: free_minute.toString(),booking_amount: booking_amount.toFixed(2).toString(),total_chargeable_amount: total_chargeable_amount.toFixed(2).toString(),discount_type: type.toString(), discount_value: discount_value.toString(),category_name: category_name.toString(), message: 'session end', wallet_amount: wallet_amount.toFixed(2)});
                    
                                                        io.sockets.in(advisor_+advisor_id).emit('end_session', {total_minute: minute.toString(),commission_rate: (advisor_commission_result[0].value).toString(),session_earning: advisor_commission_amount.toFixed(2).toString(),advisor_special_day_commission: advisor_special_day_commission.toString(),category_name: category_name.toString(), message: 'Congratulations! You have earned $'+advisor_commission_amount.toFixed(2).toString()+' from this session'}); 
                    
                                                    });
                                                });
                                            }
                                        });
                                    }
                                    else{
                                        console.log('genaral'); 
                                        var user_details = "SELECT id,wallet_amount FROM users WHERE id = '"+user_id+"'";
                                        config.con.query(user_details, function (err, result_user_details) {

                                            //console.log('wallet_amount',parseFloat(result_user_details[0].wallet_amount));
                                            wallet_amount = parseFloat(result_user_details[0].wallet_amount) - booking_amount;

                                            var sql = "UPDATE users set wallet_amount = '"+(wallet_amount).toFixed(2)+"' WHERE id = "+user_id;
                                            functions.update_record_mysql(sql,config.con);

                                            var sql1 = "Insert into wallet(user_id,booking_id,amount_type,amount,description,created_at)values("+user_id+",'"+booking_id+"','minus','"+booking_amount.toFixed(2)+"','Payment Done','"+latest_date()+"')";
                                            functions.insert_record_mysql(sql1,config.con);

                                            advisor_commission_amount = (booking_amount * parseFloat(advisor_commission_result[0].value))/100;
                                            admin_commission_amount = ( (booking_amount) * (100 -  parseFloat(advisor_commission_result[0].value)) )/100;
                                            //console.log('advisor_commission_amount_before',advisor_commission_amount);

                                            var advisor_special_day_promocode = "SELECT *,DATE_FORMAT(special_day_date, '%Y-%m-%d') as special_day FROM promocode WHERE promocode_for = 'advisor' AND status = 1 AND deleted_at IS NULL";
                                            config.con.query(advisor_special_day_promocode, function (err, result_advisor_promocode) {

                                                if(result_advisor_promocode !== undefined && result_advisor_promocode !== null && result_advisor_promocode.length > 0){

                                                    // console.log('advisor_promocode',result_advisor_promocode[0]);
                                                    var advisor_day  = (result_advisor_promocode[0].special_day);
                                                    //console.log('advisor_promocode1',advisor_day);
                                                    if(date_only() == advisor_day){

                                                        console.log('advisor_special_day');

                                                        var advisor_total_commission = parseFloat(advisor_commission_result[0].value) + parseFloat(result_advisor_promocode[0].discount_value);
                                                        console.log('advisor_total_commission',advisor_total_commission);
                                                        var admin_total_commission = 100 - parseFloat(advisor_total_commission);
                                                        console.log('admin_total_commission',admin_total_commission);

                                                        if(advisor_total_commission > 100){
                                                            advisor_total_commission = 100;
                                                        }

                                                        advisor_commission_amount = (booking_amount * parseFloat(advisor_total_commission))/100;
                                                        admin_commission_amount = ( (booking_amount) * parseFloat( admin_total_commission) )/100;
                                                        // console.log('advisor_commission_amount',advisor_commission_amount);
                                                        // console.log('admin_commission_amount',admin_commission_amount);

                                                        advisor_special_day_commission = result_advisor_promocode[0].discount_value;
                                                        if(result_advisor_promocode[0].discount_type == 'percentage'){

                                                            var percentage_amount = (booking_amount * parseFloat(result_advisor_promocode[0].discount_value))/100;
                                                            // var advisor_commission =  advisor_commission_amount;
                                                            var old_advisor_commission = (booking_amount * parseFloat(advisor_commission_result[0].value))/100;
                                                            // advisor_commission_amount = advisor_commission_amount + percentage_amount;

                                                            promocode_ids = (promocode_ids != '') ? promocode_ids+","+result_advisor_promocode[0].id : result_advisor_promocode[0].id;

                                                            var sql_special_day = "Insert into promocode_log(booking_id,promocode_id,total_minute,chargeable_minute,booking_amount,chargeable_amount,advisor_amount,advisor_special_day_amount,user_id,created_at)values("+booking_id+","+result_advisor_promocode[0].id+",'"+minute+"','"+total_minute+"','"+booking_amount.toFixed(2)+"','"+chargeable_amount.toFixed(2)+"','"+old_advisor_commission.toFixed(2)+"','"+percentage_amount.toFixed(2)+"',"+user_id+",'"+latest_date()+"')";
                                                            functions.insert_record_mysql(sql_special_day,config.con);
                                                        }
                                                    }
                                                }

                                                // console.log('advisor_commission_amount',advisor_commission_amount);
                                                // console.log('admin_commission_amount',admin_commission_amount);

                                                var sql = "UPDATE booking_request set end_time = '"+current_date+"',total = '"+booking_amount.toFixed(2)+"',advisor_commission = '"+advisor_commission_amount.toFixed(2)+"',admin_commission = '"+admin_commission_amount.toFixed(2)+"',offer_id = '"+promocode_ids+"',session_minute = '"+minute+"' WHERE id = "+booking_id;
                                                functions.update_record_mysql(sql,config.con);

                                                var advisor_amount_log = "Insert into advisor_amount_log(advisor_id,booking_id,amount,created_at)values("+advisor_id+",'"+booking_id+"','"+advisor_commission_amount.toFixed(2)+"','"+latest_date()+"')";
                                                functions.insert_record_mysql(advisor_amount_log,config.con);
                                                
                                                // var sql5 = "UPDATE availability set status = 1 WHERE user_id = "+advisor_id;
                                                // functions.update_record_mysql(sql5,config.con);

                                                var advisor_details = "SELECT id,advisor_withdrawal_amount FROM users WHERE id = '"+advisor_id+"'";
                                                config.con.query(advisor_details, function (err, result_advisor_details) {

                                                    withdrawal_amount = parseFloat(result_advisor_details[0].advisor_withdrawal_amount) + parseFloat(advisor_commission_amount);

                                                    var update_advisor_amount = "UPDATE users set advisor_withdrawal_amount = "+withdrawal_amount.toFixed(2)+" WHERE id = "+advisor_id;
                                                    functions.update_record_mysql(update_advisor_amount,config.con); 
                                                    console.log('update_advisor_amount',update_advisor_amount);
                                                });

                                                total_chargeable_amount = booking_amount;
                                                //console.log('wallet_amount_updated',wallet_amount.toFixed(2));
                                                io.sockets.in(customer_+user_id).emit('end_session', {total_minute: minute.toString(),free_minute: free_minute.toString(),booking_amount: booking_amount.toFixed(2).toString(),total_chargeable_amount: total_chargeable_amount.toFixed(2).toString(),discount_type: type.toString(), discount_value: discount_value.toString(),category_name: category_name.toString(), message: 'session end', wallet_amount: wallet_amount.toFixed(2)});

                                                io.sockets.in(advisor_+advisor_id).emit('end_session', {total_minute: minute.toString(),commission_rate: (advisor_commission_result[0].value).toString(),session_earning: advisor_commission_amount.toFixed(2).toString(),advisor_special_day_commission: advisor_special_day_commission.toString(),category_name: category_name.toString(), message: 'Congratulations! You have earned $'+advisor_commission_amount.toFixed(2).toString()+' from this session'}); 
                                            });

                                        });

                                    }

                                }
                            });

                        });

                    });

                });

            });
                       
        }
    });
    
    socket.on('video_call', function (data) {
	  	var user_id = functions.validate_params(data.customer_id);  
	  	var user_name = functions.validate_params(data.customer_name);  
	  	var advisor_id = functions.validate_params(data.advisor_id);  
	  	var advisor_name = functions.validate_params(data.advisor_name);  
	  	var booking_id = functions.validate_params(data.booking_id);
        
	  	console.log('video_call : ',data);

	  	if(user_id !== false && advisor_id !== false && booking_id !== false && advisor_name !== false)
	  	{
            token.identity = user_name.toString();
            var sender_name = user_name.toString();
            console.log("videotoken - ",token);
            const videoGrant = new VideoGrant({
                incomingAllow: true, // allows your client-side device to receive calls as well as make them
                pushCredentialSid: twilioFCMPushSID,
                room: 'TempleBliss-'+booking_id
            });
            token.addGrant(videoGrant); 
            var sender_token = token.toJwt();
            console.log("videotoken after adding grant - ",token);
            
            console.log("videoGrant - ",videoGrant);

            io.sockets.in(customer_+user_id).emit('video_call_customer', {message : "Video Call request sending..." , booking_id:booking_id,token:sender_token,name:sender_name,receiver_name: advisor_name,room:'TempleBliss-'+booking_id,user_id:user_id,receiver_id: advisor_id});

            token.identity = advisor_name.toString();
            const videoGrant2 = new VideoGrant({
                incomingAllow: true, // allows your client-side device to receive calls as well as make them
                pushCredentialSid: twilioFCMPushSID,
                room: 'TempleBliss-'+booking_id
            });
            // console.log("videoGrant2 - ",videoGrant2);

            token.addGrant(videoGrant2);
            var receiver_token = token.toJwt();
            
            setTimeout(function() { 
                io.sockets.in(advisor_+advisor_id).emit('video_call_advisor', {message : "Video Call received from customer..." , booking_id:booking_id , token:receiver_token,name:sender_name,receiver_name: advisor_name,room:'TempleBliss-'+booking_id,user_id:user_id,receiver_id: advisor_id});
            }, 1000);

            console.log("advisor----- ",advisor_id);

            var send_push_data = {};
            send_push_data['token'] = receiver_token;
            send_push_data['advisor_name'] = advisor_name.toString();
            send_push_data['room_id'] = 'TempleBliss-'+booking_id;
            send_push_data['user_id'] = user_id;
            send_push_data['receiver_id'] = advisor_id;
            send_push_data['user_name'] = sender_name;
            send_push_data['booking_id'] = booking_id;
            send_push_data['type'] = "video";
            // console.log(send_push_data);
            //  send_push(receiver_id,'users','Incoming call','New video call from '+sender_name,'call',visit_id,send_push_data);
            send_push(advisor_id,'users','Incoming call','Please be patient while your customer '+sender_name+' prepares to call ','call',booking_id,send_push_data,silent_type = "silent");

	  	}
	});
    
    socket.on('pick_up_call', function (data) {

	  	var user_id = functions.validate_params(data.user_id);  
	  	var advisor_id = functions.validate_params(data.advisor_id);  
	  	var advisor_name = functions.validate_params(data.advisor_name);  
	  	var booking_id = functions.validate_params(data.booking_id);
        var start_time = latest_date();
	  	console.log('pick_up_call : ',data);

	  	if(user_id !== false && advisor_id !== false && booking_id !== false)
	  	{
            var receiver_name = advisor_name;
            var title = 'Call accepted';
            var description = receiver_name+' is on the line.';              

            // var send_push_data = {};
            // send_push_data['room_id'] = 'TempleBliss-'+booking_id;
            // send_push_data['advisor_name'] = receiver_name;
            // send_push_data['advisor_id'] = advisor_id;
            // send_push_data['user_id'] = user_id;
            // send_push(user_id,'users', title, description, 'pick_up_call',booking_id,send_push_data );

            var sql = "UPDATE booking_request set start_time = '"+start_time+"',is_session_running = 1 WHERE id = "+booking_id+"";
            functions.update_record_mysql(sql,config.con);

            io.sockets.in(customer_+user_id).emit('pick_up_call', {message :description , booking_id:booking_id , receiver_name:receiver_name,room_id:'TempleBliss-'+booking_id,user_id:user_id,advisor_id:advisor_id});
	  	}
	});
    
    socket.on('call_reject_by_user', function (data) {

	  	var user_id = functions.validate_params(data.user_id);  
	  	var user_name = functions.validate_params(data.user_name);  
	  	var advisor_id = functions.validate_params(data.advisor_id);  
	  	var booking_id = functions.validate_params(data.booking_id);
	  	var call_status = functions.validate_params(data.call_status);

	  	console.log('call_reject_by_user : ',data);

	  	if(user_id !== false && advisor_id !== false && booking_id !== false)
	  	{
            var sender_name = user_name;
            var status = '';
            if(call_status == 'after_receive')
            {
                var title = 'Call ended';
                var description = 'Call completed with '+sender_name; 
                status = 'yes';
                var booking_status = 1;
                var reject_call_detail = 3;
            }				
            else
            {
                var title = 'Missed call';
                var description = sender_name+' tried to call you.';              	
                status = 'no';
                var booking_status = 2;
                var reject_call_detail = 2;
            }

            var send_push_data = {};
            send_push_data['message'] = description;
            send_push_data['booking_id'] = booking_id;
            send_push_data['sender_name'] = sender_name;
            send_push_data['room_id'] = 'TempleBliss-'+booking_id;
            send_push_data['advisor_id'] = advisor_id;
            send_push_data['user_id'] = user_id;
            send_push_data['call_status'] = call_status;

            var sql_status = "UPDATE booking_request set status = "+booking_status+",reject_call_detail = "+reject_call_detail+" WHERE id = "+booking_id;
            functions.update_record_mysql(sql_status,config.con);
            
            io.sockets.in(advisor_+advisor_id).emit('call_reject_by_user', {message :description , booking_id:booking_id , sender_name:sender_name,room_id:'TempleBliss-'+booking_id,user_id:user_id,advisor_id:advisor_id,call_status: call_status});
           
            send_push(advisor_id,'users', title, description, 'call_reject_by_user',booking_id,send_push_data,silent_type = "silent");

            var available_for_data = "SELECT available_for FROM users WHERE id = "+advisor_id;
            config.con.query(available_for_data, function (err, result_available_for_data) {

                var type = result_available_for_data[0].available_for;
            
                var available_for_active = "UPDATE availability set status = 1 WHERE type IN("+type+") AND user_id = "+advisor_id;
                functions.update_record_mysql(available_for_active,config.con);

                var available_for_inactive = "UPDATE availability set status = 0 WHERE type NOT IN("+type+") AND user_id = "+advisor_id;
                functions.update_record_mysql(available_for_inactive,config.con);
                
            });

            var call_history_details = "SELECT id FROM call_history WHERE booking_id = "+booking_id;
			config.con.query(call_history_details, function (err, result_call_history_details) {
                
                if(result_call_history_details.length == 0){
                    var sql = "Insert into call_history(sender_id,receiver_id,answer,reject_by,booking_id,room_id,created_at)values('"+user_id+"','"+advisor_id+"','"+status+"','user','"+booking_id+"','TempleBliss-"+booking_id+"','"+latest_date()+"')";
                    functions.insert_record_mysql(sql,config.con);   
                }
            });         	          			
	  	}
	});
    
    socket.on('call_reject_by_advisor', function (data) {

	  	var user_id = functions.validate_params(data.user_id);  
	  	var user_name = functions.validate_params(data.user_name);  
	  	var advisor_id = functions.validate_params(data.advisor_id);  
	  	var booking_id = functions.validate_params(data.booking_id);
	  	var call_status = functions.validate_params(data.call_status);

	  	console.log('call_reject_by_advisor : ',data);

	  	if(user_id !== false && advisor_id !== false && booking_id !== false)
	  	{
            var receiver_name = user_name;
            var status = '';
            if(call_status == 'after_receive')
            {
                var title = 'Call ended';
                var description = 'Call completed with '+receiver_name;	
                status = 'yes';
                var booking_status = 1;
                var reject_call_detail = 3;
            }
            else
            {
                var title = 'Call rejected';
                var description = receiver_name+' is unable to answer your call.';
                status = 'no';
                var booking_status = 2;
                var reject_call_detail = 2;
            }

            var send_push_data = {};
            send_push_data['room_id'] = 'TempleBliss-'+booking_id;
            send_push_data['receiver_name'] = receiver_name;
            send_push_data['user_id'] = user_id;
            send_push_data['advisor_id'] = advisor_id;
            send_push_data['message'] = description;
            send_push_data['booking_id'] = booking_id;
            send_push_data['call_status'] = call_status;
            send_push_data['status'] = status;

            var user_details = "SELECT wallet_amount FROM users WHERE id = "+user_id;
			config.con.query(user_details, function (err, result_user_details) {

				io.sockets.in(customer_+user_id).emit('call_reject_by_advisor', {message :description , booking_id:booking_id , receiver_name:receiver_name,room_id:'TempleBliss-'+booking_id,advisor_id:advisor_id,user_id:user_id,status:status,wallet_amount: result_user_details[0].wallet_amount,call_status: call_status});
                send_push_data['wallet_amount'] = result_user_details[0].wallet_amount;

				send_push(user_id,'users', title, description, 'call_reject_by_advisor',booking_id,send_push_data,silent_type = "silent");

                var sql_status = "UPDATE booking_request set status = "+booking_status+",reject_call_detail = "+reject_call_detail+" WHERE id = "+booking_id;
                functions.update_record_mysql(sql_status,config.con);

                var available_for_data = "SELECT available_for FROM users WHERE id = "+advisor_id;
                config.con.query(available_for_data, function (err, result_available_for_data) {

                    var type = result_available_for_data[0].available_for;
                
                    var available_for = "UPDATE availability set status = 1 WHERE type IN("+type+") AND user_id = "+advisor_id;
                    functions.update_record_mysql(available_for,config.con);

                    var available_for_inactive = "UPDATE availability set status = 0 WHERE type NOT IN("+type+") AND user_id = "+advisor_id;
                    functions.update_record_mysql(available_for_inactive,config.con);

                });

                var call_history_details = "SELECT id FROM call_history WHERE booking_id = "+booking_id;
                config.con.query(call_history_details, function (err, result_call_history_details) {
                    
                    if(result_call_history_details.length == 0){
                        var sql = "Insert into call_history(sender_id,receiver_id,answer,reject_by,booking_id,room_id,created_at)values('"+advisor_id+"','"+user_id+"','"+status+"','advisor','"+booking_id+"','TempleBliss-"+booking_id+"','"+latest_date()+"')";
	                    functions.insert_record_mysql(sql,config.con);   
                    }
                }); 
	            	
			});

            // io.sockets.in(customer_+user_id).emit('call_reject_by_advisor', {message :description , booking_id:booking_id , receiver_name:receiver_name,room_id:'TempleBliss-'+booking_id,advisor_id:advisor_id,user_id:user_id,status:status});
            // send_push(user_id,'users', title, description, 'call_reject_by_advisor',booking_id,send_push_data );

            // var sql = "Insert into call_history(sender_id,receiver_id,answer,reject_by,room_id,created_at)values('"+advisor_id+"','"+user_id+"','"+status+"','advisor','TempleBliss-"+booking_id+"','"+latest_date()+"')";
            // functions.insert_record_mysql(sql,config.con);	

            //upper changes for wallet amount added (sandho)
	  		
	  	}
	});

    socket.on('disconnect', function () {

        var user_id = functions.validate_params(socket.username);
        if (user_id !== false)
        {
            var user = socket.username;
            var room = socket.room;
            
            var customer_prefix = config.customer_prefix;
            var advisor_prefix = config.advisor_prefix;
            
            if (user.indexOf(customer_prefix) > -1)
            {
                delete customer[socket.username];
	    		socket.leave(socket.room);
                var client_id = user.replace(customer_prefix, '');
                client_id = parseInt(client_id);
                console.log('customer_id--' + client_id);
                var index = customer_list.indexOf(client_id);
                console.log('disconnect Customer............................................ : ',client_id);
                
                var is_session_pending = 'SELECT booking_request.id,type,status,is_session_running,advisor_id,wallet_amount FROM booking_request LEFT JOIN users ON booking_request.user_id = users.id WHERE user_id = '+parseInt(client_id)+' AND end_time IS NULL AND is_session_running = 0 ORDER BY id DESC LIMIT 1';
                config.con.query(is_session_pending, function (err, result_session_pending) {
                    
                    console.log('result_session_pending_customer',result_session_pending);
                    
                    if(result_session_pending !== undefined && result_session_pending !== null && result_session_pending.length > 0){

                        var type = result_session_pending[0].type;
                        var status = result_session_pending[0].status;
                        var id = result_session_pending[0].id;
                        var is_session_running = result_session_pending[0].is_session_running;
                        var advisor = result_session_pending[0].advisor_id;
                        
                        if((type == "video" || type == "audio") && status != 2 && is_session_running == 0){
                          var flag = true;
                        }
                        else if(status == 0 && type == "chat"){
                           var flag = true;
                        }else{
                            var flag = false;
                        }
                        console.log('flag',flag);
                        if(flag == true){

                            var available_for_data = "SELECT available_for FROM users WHERE id = "+advisor;
                            config.con.query(available_for_data, function (err, result_available_for_data) {

                                var type = result_available_for_data[0].available_for;
                            
                                var available_for = "UPDATE availability set status = 1 WHERE type IN("+type+") AND user_id = "+advisor;
                                functions.update_record_mysql(available_for,config.con);

                                var available_for_inactive = "UPDATE availability set status = 0 WHERE type NOT IN("+type+") AND user_id = "+advisor;
                                functions.update_record_mysql(available_for_inactive,config.con);

                            });

                            //console.log('advisor',advisor);
                            var start_time = latest_date();
                            var sql4 = "UPDATE booking_request set status_update_date = '"+start_time+"',status = 2 WHERE id = "+id;
                            functions.update_record_mysql(sql4,config.con);
                            io.sockets.in(advisor_+advisor).emit('request_reject_disconnect', {message: "Request Rejected",type: type});
                        }
                    }

                });

                var is_session_runnig = "SELECT booking_request.id,advisor_id,booking_request.category_id,category.name as category_name, availability.price, DATE_FORMAT(users.dob, '%Y-%m-%d %H:%i:%s') as dob, DATE_FORMAT(booking_request.start_time, '%H:%i:%s') as start_time FROM booking_request JOIN availability ON advisor_id = availability.user_id JOIN users on booking_request.user_id = users.id join category on booking_request.category_id = category.id WHERE booking_request.user_id = "+client_id+" AND booking_request.status = 1 AND booking_request.is_session_running = 1 AND end_time IS NULL AND booking_request.category_id = availability.category_id AND booking_request.type = availability.type ORDER BY booking_request.id DESC LIMIT 1";
                config.con.query(is_session_runnig, function (err, result_session_runnig) {

                    if(result_session_runnig !== undefined && result_session_runnig !== null && result_session_runnig.length > 0){
                        //console.log('test_here',result_session_runnig);
                        var current_time = latest_time_only();
                        var mins = moment.utc(moment(current_time, "HH:mm:ss").diff(moment(result_session_runnig[0].start_time, "HH:mm:ss"))).format("mm:ss");
                        console.log('mins'+mins);

                        var available_for_data = "SELECT available_for FROM users WHERE id = "+result_session_runnig[0].advisor_id;
                        config.con.query(available_for_data, function (err, result_available_for_data) {

                            var type = result_available_for_data[0].available_for;
                            var available_for = "UPDATE availability set status = 1 WHERE type IN("+type+") AND user_id = "+result_session_runnig[0].advisor_id;
                            functions.update_record_mysql(available_for,config.con);

                            var available_for_inactive = "UPDATE availability set status = 0 WHERE type NOT IN("+type+") AND user_id = "+result_session_runnig[0].advisor_id;
                            functions.update_record_mysql(available_for_inactive,config.con);

                        });
                        
                        end_sesion(client_id, result_session_runnig[0].advisor_id, result_session_runnig[0].id, mins.toString(), result_session_runnig[0].price, result_session_runnig[0].dob.toString(),result_session_runnig[0].category_name.toString());
                    }
                });
                
                if (index > -1)
                {
                    customer_list.splice(index, 1);
                }
            }

            if (user.indexOf(advisor_prefix) > -1)
            {
                var vet_id = user.replace(advisor_prefix, '');
                vet_id = parseInt(vet_id);
                //this availability code is commented because of background scenarios
                //var sql = "UPDATE availability set status = 0 WHERE user_id = "+vet_id+"";
                //functions.update_record_mysql(sql,config.con);
                //io.sockets.in("normal_users").emit("advisor_inactive", {advisor_id: vet_id});
                console.log('advisor_id - ' + vet_id);
                var index = advisor_list.indexOf(vet_id);
                console.log('disconnect Advisor............................................ : ',vet_id);
                
                var is_session_pending = 'SELECT booking_request.id,type,status,is_session_running,user_id,wallet_amount FROM booking_request LEFT JOIN users ON booking_request.user_id = users.id WHERE advisor_id = '+parseInt(vet_id)+' AND end_time IS NULL AND is_session_running = 0 ORDER BY id DESC LIMIT 1';
                //console.log('is_session_pending',is_session_pending);
                //SELECT id,user_id FROM booking_request  WHERE advisor_id = '+parseInt(vet_id)+' AND (type = "video" AND status != 2 AND end_time IS NULL AND is_session_running = 0) OR (status = 0 AND end_time IS NULL AND is_session_running = 0) ORDER BY booking_request.id DESC LIMIT 1
                config.con.query(is_session_pending, function (err, result_session_pending) {

                    if(result_session_pending !== undefined && result_session_pending !== null && result_session_pending.length > 0){
                        var type = result_session_pending[0].type;
                        var status = result_session_pending[0].status;
                        var id = result_session_pending[0].id;
                        var is_session_running = result_session_pending[0].is_session_running;
                        var user = result_session_pending[0].user_id;
                        var wallet_amount = result_session_pending[0].wallet_amount;
                        
                        if((type == "video" || type == "audio") && status != 2 && is_session_running == 0){
                          var flag = true;
                        }
                        else if(status == 0 && type == "chat"){
                           var flag = true;
                        }else{
                            var flag = false;
                        }
                        console.log('flag',flag);

                        if(flag == true){

                            var available_for_data = "SELECT available_for FROM users WHERE id = "+vet_id;
                            config.con.query(available_for_data, function (err, result_available_for_data) {

                                var type = result_available_for_data[0].available_for;
                                var available_for = "UPDATE availability set status = 1 WHERE type IN("+type+") AND user_id = "+vet_id;
                                functions.update_record_mysql(available_for,config.con);

                                var available_for_inactive = "UPDATE availability set status = 0 WHERE type NOT IN("+type+") AND user_id = "+vet_id;
                                functions.update_record_mysql(available_for_inactive,config.con);
 
                            });

                            var start_time = latest_date();
                            
                            var sql4 = "UPDATE booking_request set status_update_date = '"+start_time+"',status = 2 WHERE id = "+id;
                            functions.update_record_mysql(sql4,config.con);
                            io.sockets.in(customer_+user).emit('request_reject_disconnect', {message: "Request Rejected",wallet_amount: wallet_amount,type: type});
                        }
                    }

                });    

                var is_session_runnig = "SELECT booking_request.id, booking_request.user_id,advisor_id,booking_request.category_id,category.name as category_name, availability.price,DATE_FORMAT(users.dob, '%Y-%m-%d %H:%i:%s') as dob ,DATE_FORMAT(booking_request.start_time, '%H:%i:%s') as start_time FROM booking_request JOIN availability ON advisor_id = availability.user_id JOIN users on booking_request.user_id = users.id join category on booking_request.category_id = category.id WHERE booking_request.advisor_id = "+vet_id+" AND booking_request.status = 1 AND booking_request.is_session_running = 1 AND end_time IS NULL AND booking_request.category_id = availability.category_id AND booking_request.type = availability.type ORDER BY booking_request.id DESC LIMIT 1";
                // console.log(is_session_runnig);
                config.con.query(is_session_runnig, function (err, result_session_runnig) {

                    if(result_session_runnig !== undefined && result_session_runnig !== null && result_session_runnig.length > 0){

                        //console.log(result_session_runnig);
                        var current_time = latest_time_only();
                        var mins = moment.utc(moment(current_time, "HH:mm:ss").diff(moment(result_session_runnig[0].start_time, "HH:mm:ss"))).format("mm:ss");
                        console.log('mins'+mins);

                        end_sesion(result_session_runnig[0].user_id, vet_id, result_session_runnig[0].id, mins.toString(), result_session_runnig[0].price, result_session_runnig[0].dob.toString(),result_session_runnig[0].category_name.toString());
                    }
                });
                         
                if (index > -1)
                {
                    advisor_list.splice(index, 1);
                }
            }
        }

    });
    
});



function send_push(user_id, user_type, title, message_body, type, booking_id = '', send_push_data = [],silent_type = '') {
    var table = user_type;
    var where = 'id = ' + user_id;
    var select = 'device_type,device_token,id';

    functions.get_results_mysql(table, where, select, config.con, function (results) {

        if (results !== undefined && results !== null && results.length > 0)
        {
            if (results[0].device_token !== undefined && results[0].device_token !== '' && results[0].device_token !== null)
            {
                var sql = "Insert into notification(sent_to,sent_by,title,description,created_at)values('"+user_id+"','1','"+title+"','"+message_body+"','"+latest_date()+"')";
	            functions.insert_record_mysql(sql,config.con);

                if(results[0].device_type == 1){var sound = "apple";}else{var sound = "default";}
                
                var push_data = {
                    body: message_body,
                    title: title,
                    'sound': sound,
                    type: type,
                    visit_id: booking_id,
                    response: send_push_data,
                };
                if (results[0].device_type == 2 || results[0].device_type == '2')
                {
                    var message = {
                        to: results[0].device_token,
                        priority: 'high',
                        data: push_data
                    };
                } else
                {
                    if(silent_type == "silent"){
                        var message = {
                            to: results[0].device_token,
                            priority: 'high',
                            content_available: "true",
                            notification: push_data
                        };
                    }else{
                        var message = {
                            to: results[0].device_token,
                            priority: 'high',
                            notification: push_data
                        };
                    
                    }
              //  console.log('content-available',content_available);
                   
                }

                fcm.send(message, function (err, response) {
                    if (err) {
                        console.log("Something has gone wrong!" + err);
                    } else {
                        console.log("response!" + response);
                    }
                });

            }
        }

    });
}

function send_push_silent(user_id, user_type, title, message_body, type, booking_id = '', send_push_data = []) {
    var table = user_type;
    var where = 'id = ' + user_id;
    var select = 'device_type,device_token,id';

    functions.get_results_mysql(table, where, select, config.con, function (results) {

        if (results !== undefined && results !== null && results.length > 0)
        {
            if (results[0].device_token !== undefined && results[0].device_token !== '' && results[0].device_token !== null)
            {
                var sql = "Insert into notification(sent_to,sent_by,title,description,created_at)values('"+user_id+"','1','"+title+"','"+message_body+"','"+latest_date()+"')";
	            functions.insert_record_mysql(sql,config.con);

                if(results[0].device_type == 1){var sound = "";}else{var sound = "default";}
                var push_data = {
                    body: message_body,
                    title: title,
                    sound: sound,
                    type: type,
                    visit_id: booking_id,
                    response: send_push_data,
                };
                if (results[0].device_type == 2 || results[0].device_type == '2')
                {
                    var message = {
                        to: results[0].device_token,
                        priority: 'high',
                        data: push_data
                    };
                } else
                {
                    var message = {
                        to: results[0].device_token,
                        priority: 'high',
                        "content-available": 0,
                        notification: push_data
                    };
                }

                fcm.send(message, function (err, response) {
                    if (err) {
                        console.log("Something has gone wrong!" + err);
                    } else {
                        console.log("response!" + response);
                    }
                });

            }
        }

    });
}

// function voice_call(){

//     voice.calls
//       .create({
//         url: 'http://demo.twilio.com/docs/voice.xml',
//         to: '+13474718340',
//         from: '+19292698686'
//       })
//       .then(call => console.log(call.sid))
//       .done();
// }

function dateConvert(date)
{
    var date_convert = moment(date).format('DD-MMM h:mm A');
    return date_convert;
}

function latest_date() {
    var UpdatedDate = new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York'
    });

    return moment(UpdatedDate).format('YYYY-MM-DD HH:mm:ss');
}

function latest_date_only() {
    var UpdatedDate = new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York'
    });

    return moment(UpdatedDate).format('MM-DD');
}

function date_only() {
    var UpdatedDate = new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York'
    });

    return moment(UpdatedDate).format('YYYY-MM-DD');
}

function latest_time_only() {
    var UpdatedDate = new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York'
    });

    return moment(UpdatedDate).format('HH:mm:ss');
}

function fmtMSS(s){
    return(s-(s%=60))/60+(9<s?':':':0')+s
}

function arrayColumn(array, columnName) {
    return array.map(function(value,index) {
        return value[columnName];
    })
}
